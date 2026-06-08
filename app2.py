import sys
import sqlite3
import shutil
import win32print
import win32ui
from tkinter import messagebox
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QTextEdit, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QPushButton, QMessageBox, QComboBox, QFileDialog, 
    QAction, QDialog, QCompleter, QTableView, QAbstractItemView, QHeaderView, QGridLayout
)
from PyQt5.QtCore import QDateTime, Qt, QSortFilterProxyModel, QAbstractTableModel
from PyQt5.QtGui import QFont, QColor, QDoubleValidator
import datetime

class MLDataModel:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.ml_initialized = False

class CustomTableModel(QAbstractTableModel):
    def __init__(self, data=None):
        super().__init__()
        self._data = data if data is not None else []
        self._headers = ['ID', "Ім'я", 'Телефон', 'Тип', 'Модель', 'Бренд', 'Несправність', 'Ціна', 'Дата прийому', 'Дата повернення', 'Статус', 'Примітки']

    def data(self, index, role):
        if role == Qt.DisplayRole:
            return str(self._data[index.row()][index.column()])
        elif role == Qt.BackgroundRole:
            status = self._data[index.row()][10]
            if status == 'Прийнято':
                return QColor('#e6f7ff')
            elif status == 'Готово':
                return QColor('#e6ffe6')
            elif status == 'Видано':
                return QColor('#f0f0f0')
            elif status == 'Без ремонту':
                return QColor('#fff5e6')
            elif status == 'В ремонті':
                return QColor('#ffe6e6')
            elif status == 'На погодженні':
                return QColor('#f5e6ff')
        return None

    def rowCount(self, index):
        return len(self._data)

    def columnCount(self, index):
        return len(self._headers) if self._data else 0

    def headerData(self, section, orientation, role):
        if role == Qt.DisplayRole and orientation == Qt.Horizontal:
            return self._headers[section]
        return None

    def setData(self, index, value, role=Qt.EditRole):
        if role == Qt.EditRole:
            self._data[index.row()][index.column()] = value
            return True
        return False

    def flags(self, index):
        return Qt.ItemIsSelectable | Qt.ItemIsEnabled

class ModernServiceCenterApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Сервісний центр • Система управління")
        self.setGeometry(100, 100, 1200, 800)
        self.ml_model = MLDataModel()
        self.colors = {
            'primary': '#78f09c',
            'secondary': '#98c6f5',
            'accent': '#388E3C',
            'text': '#1f2937',
            'light_text': '#6b7280',
            'success': '#059669',
            'white': '#f7fcf2',
            'olive': '#e1f4fc',
            'red': '#ff4d4d',
            'blue': '#4d94ff',
            'yellow': '#ffcc00',
            'green': '#00cc00',
            'wave': '#cbf2de'
        }
        self.create_database()
        self.setup_styles()
        self.init_ui()
        self.update_autocomplete_data()
        self.check_status_reminders()
        self.create_format_menu()
        self.load_ml_model()
        self.init_firebase()

    def init_firebase(self):
        try:
            import firebase_admin
            from firebase_admin import credentials, db
            import os, sys
            
            # Визначаємо шлях до папки (підтримка PyInstaller)
            if getattr(sys, 'frozen', False):
                base_path = sys._MEIPASS
            else:
                base_path = os.path.abspath(".")
                
            # Знаходимо json файл ключа
            json_files = [f for f in os.listdir(base_path) if f.endswith('.json') and 'firebase' in f]
            if json_files:
                key_path = os.path.join(base_path, json_files[0])
                cred = credentials.Certificate(key_path)
                if not firebase_admin._apps:
                    firebase_admin.initialize_app(cred, {
                        'databaseURL': 'https://texnoplus-service-default-rtdb.europe-west1.firebasedatabase.app/'
                    })
                self.firebase_initialized = True
            else:
                print("Firebase JSON key not found!")
                self.firebase_initialized = False
        except Exception as e:
            print(f"Firebase Init Error: {e}")
            self.firebase_initialized = False

    def sync_to_firebase(self, record_id):
        if not getattr(self, 'firebase_initialized', False):
            return
        def _sync():
            try:
                from firebase_admin import db
                import sqlite3
                with sqlite3.connect('service_center.db') as conn:
                    c = conn.cursor()
                    c.execute("SELECT id, phone, status, device_type, brand, device_model, issue, estimated_price, client_name, notes, client_message FROM repairs WHERE id = ?", (record_id,))
                    record = c.fetchone()
                    if record:
                        r_id, phone, status, dev_type, brand, model, issue, price, client_name, notes, client_message = record
                        clean_phone = ''.join(filter(str.isdigit, str(phone))) if phone else ""
                        safe_phone = clean_phone[-4:] if len(clean_phone) >= 4 else "0000"
                        import datetime
                        current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
                        
                        data = {
                            "id": r_id,
                            "client_name": client_name,
                            "phone_last4": safe_phone,
                            "status": status,
                            "device": f"{dev_type} {brand} {model}".strip(),
                            "issue": issue,
                            "price": price,
                            "notes": notes if notes else "",
                            "client_message": client_message if client_message else "",
                            "update_date": current_date
                        }
                        db.reference(f'repairs/{r_id}').set(data)
            except Exception as e:
                print(f"Firebase Sync Error: {e}")
        import threading
        threading.Thread(target=_sync, daemon=True).start()

    def delete_from_firebase(self, record_id):
        if not getattr(self, 'firebase_initialized', False):
            return
        def _del():
            try:
                from firebase_admin import db
                db.reference(f'repairs/{record_id}').delete()
            except Exception:
                pass
        import threading
        threading.Thread(target=_del, daemon=True).start()

    def load_ml_model(self):
        try:
            self.ml_model.model = joblib.load('price_model.pkl')
            self.ml_model.preprocessor = joblib.load('preprocessor.pkl')
            self.ml_model.ml_initialized = True
        except:
            self.ml_model.ml_initialized = False
            self.retrain_model()  # Навчання моделі при запуску, якщо модель не знайдена

        # Перевірка кількості записів і перенавчання моделі
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM repairs WHERE estimated_price > 0")
            count = c.fetchone()[0]
            
        if count % 10 == 0:  # Перенавчання кожні 10 записів
            self.retrain_model()

    def retrain_model(self):
        try:
            conn = sqlite3.connect('service_center.db')
            query = '''SELECT device_type, brand, device_model, issue, estimated_price 
                    FROM repairs WHERE estimated_price > 0'''
            data = pd.read_sql_query(query, conn)
            conn.close()

            # Заповнення відсутніх значень моделі
            data['device_model'] = data['device_model'].fillna('Unknown')

            if len(data) < 1:
                return

            # Оновлений препроцесор з ієрархією
            preprocessor = ColumnTransformer([
                ('device_type', OneHotEncoder(handle_unknown='ignore'), ['device_type']),  # Найвищий рівень
                ('brand', OneHotEncoder(handle_unknown='ignore'), ['brand']),             # Другий рівень
                ('model', OneHotEncoder(handle_unknown='ignore'), ['device_model']),      # Третій рівень
                ('issue', TfidfVectorizer(max_features=100), 'issue')                     # Четвертий рівень
            ])

            # Модель з оновленими ознаками
            model = Pipeline([
                ('preprocessor', preprocessor),
                ('regressor', RandomForestRegressor(n_estimators=100))
            ])

            model.fit(data[['device_type', 'brand', 'device_model', 'issue']], data['estimated_price'])
            joblib.dump(model, 'price_model.pkl')
            self.ml_model.model = model
            self.ml_model.ml_initialized = True

        except Exception as e:
            print("Помилка тренування:", str(e))

    def predict_price(self):
        if not self.ml_model.ml_initialized:
            return None

        device_type = self.device_type_entry.currentText()
        brand = self.brand_entry.currentText()
        model = self.model_entry.currentText().strip() or 'Unknown'  # Обробка порожніх значень
        issue = self.issue_entry.currentText()

        try:
            input_data = pd.DataFrame([[device_type, brand, model, issue]], 
                                    columns=['device_type', 'brand', 'device_model', 'issue'])
            predicted = self.ml_model.model.predict(input_data)[0]
            return round(predicted / 10) * 10  # Заокруглення до 10 грн
        except Exception as e:
            print("Помилка прогнозу:", str(e))
            return None

    def is_regular_client(self, phone):
        """Перевірка, чи клієнт є постійним (на основі кількості замовлень)"""
        if not phone:
            return False
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM repairs WHERE phone = ?", (phone,))
            count = c.fetchone()[0]
        return count >= 1  # Постійний клієнт, якщо ≥3 замовлень

    def create_format_menu(self):
        """Створення меню для форматування даних"""
        menubar = self.menuBar()
        # Змінюємо назву меню на більш загальну
        format_menu = menubar.addMenu("Додатково")

        # Додаємо дію для форматування даних
        format_action = QAction("Виправити формат записів", self)
        format_action.triggered.connect(self.format_records)
        format_menu.addAction(format_action)
        
        # Додаємо дію для синхронізації
        sync_action = QAction("Синхронізувати базу із сайтом", self)
        sync_action.triggered.connect(self.sync_all_to_firebase)
        format_menu.addAction(sync_action)
        
        # Додаємо дію для копіювання бази
        backup_action = QAction("Копіювання бази", self)
        backup_action.triggered.connect(self.backup_database)
        format_menu.addAction(backup_action)
        
        # Додаємо дію для відновлення бази
        restore_action = QAction("Відновити базу", self)
        restore_action.triggered.connect(self.restore_database)
        format_menu.addAction(restore_action)

    def format_records(self):
        """Функція для форматування записів у базі даних"""
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            
            # Отримуємо всі записи
            c.execute('SELECT * FROM repairs')
            records = c.fetchall()
            
            for record in records:
                record_id = record[0]
                client_name = self.format_client_name(record[1])
                phone = record[2]
                device_type = self.format_general_text(record[3])
                device_model = self.format_general_text(record[4])
                brand = self.format_brand(record[5])
                issue = self.format_general_text(record[6])
                estimated_price = record[7]
                receipt_date = record[8]
                return_date = record[9]
                status = record[10]
                notes = self.format_general_text(record[11])
                
                # Оновлюємо запис у базі даних
                c.execute('''UPDATE repairs 
                            SET client_name = ?, device_type = ?, device_model = ?, brand = ?, issue = ?, notes = ?
                            WHERE id = ?''', 
                        (client_name, device_type, device_model, brand, issue, notes, record_id))
            
            conn.commit()
        
        QMessageBox.information(self, "Успіх", "Форматування записів завершено успішно")
        self.refresh_table()

    def sync_all_to_firebase(self):
        """Ручна синхронізація всієї бази з Firebase"""
        if not getattr(self, 'firebase_initialized', False):
            QMessageBox.warning(self, "Помилка", "З'єднання з сайтом не ініціалізовано. Перевірте файл ключа.")
            return
            
        QMessageBox.information(self, "Синхронізація", "Розпочато повну синхронізацію з сайтом. Це працює у фоновому режимі та може зайняти кілька секунд.")
        
        def _sync_all():
            try:
                from firebase_admin import db
                import sqlite3
                import datetime
                
                with sqlite3.connect('service_center.db') as conn:
                    c = conn.cursor()
                    c.execute("SELECT id, phone, status, device_type, brand, device_model, issue, estimated_price, client_name, notes, client_message FROM repairs")
                    records = c.fetchall()
                
                if not records:
                    return
                
                updates = {}
                for record in records:
                    r_id, phone, status, dev_type, brand, model, issue, price, client_name, notes, client_message = record
                    
                    clean_phone = ''.join(filter(str.isdigit, str(phone))) if phone else ""
                    safe_phone = clean_phone[-4:] if len(clean_phone) >= 4 else "0000"
                    current_date = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
                    
                    data = {
                        "id": r_id,
                        "client_name": client_name if client_name else "Невідомо",
                        "phone_last4": safe_phone,
                        "status": status,
                        "device": f"{dev_type} {brand} {model}".strip(),
                        "issue": issue if issue else "",
                        "price": price if price else 0,
                        "notes": notes if notes else "",
                        "client_message": client_message if client_message else "",
                        "update_date": current_date
                    }
                    updates[str(r_id)] = data
                
                if updates:
                    db.reference('repairs').update(updates)
                    print(f"Синхронізовано {len(updates)} записів.")
                    
            except Exception as e:
                print(f"Full Sync Error: {e}")
                
        import threading
        threading.Thread(target=_sync_all, daemon=True).start()

    def format_client_name(self, name):
        """Форматування імені клієнта: кожне слово з великої букви"""
        return ' '.join(word.capitalize() for word in name.split())

    def format_brand(self, brand):
        """Форматування бренду: всі літери великі"""
        return brand.upper()

    def format_general_text(self, text):
        """Форматування загального тексту: перше слово з великої букви"""
        if not text:
            return text
        return text[0].upper() + text[1:].lower()

    def check_status_reminders(self):
        """Перевірка статусу записів для нагадувань"""
        reminders = []
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute("SELECT id, status, receipt_date, device_type, phone FROM repairs")
            records = c.fetchall()
            for record in records:
                record_id, status, receipt_date, device_type, phone = record
                if status == 'Прийнято':
                    if datetime.datetime.now() - datetime.datetime.strptime(receipt_date, '%Y-%m-%d %H:%M') > datetime.timedelta(hours=24):
                        reminders.append(f"ID {record_id}, {phone}, {device_type} в ремонті більше 24 годин!")
                elif status == 'Готово':
                    if datetime.datetime.now() - datetime.datetime.strptime(receipt_date, '%Y-%m-%d %H:%M') > datetime.timedelta(days=3):
                        reminders.append(f"ID {record_id}, {phone}, {device_type} готовий більше 3 днів!")
        if reminders:
            self.show_reminders(reminders)

    def show_reminders(self, reminders):
        """Відображення списку нагадувань у новому вікні"""
        reminder_window = QDialog(self)
        reminder_window.setWindowTitle("Нагадування")
        reminder_window.setGeometry(100, 100, 400, 400)
        layout = QVBoxLayout()
        text_widget = QTextEdit(reminder_window)
        text_widget.setReadOnly(True)
        for reminder in reminders:
            text_widget.append(reminder)
        layout.addWidget(text_widget)
        reminder_window.setLayout(layout)
        reminder_window.exec_()

    def confirm_delete_record(self):
        """Вікно підтвердження видалення запису"""
        selected = self.table.selectionModel().selectedRows()
        if not selected:
            QMessageBox.warning(self, "Помилка", "Виберіть запис для видалення")
            return

        # Створення діалогового вікна для підтвердження
        confirm_dialog = QDialog(self)
        confirm_dialog.setWindowTitle("Підтвердження видалення")
        confirm_dialog.setGeometry(100, 100, 300, 150)
        layout = QVBoxLayout()

        # Додаємо поле для введення коду
        code_label = QLabel("Введіть код для підтвердження видалення:")
        layout.addWidget(code_label)

        self.code_entry = QLineEdit()
        self.code_entry.setPlaceholderText("Пароль для своїх")
        layout.addWidget(self.code_entry)

        # Кнопка "Підтвердити"
        confirm_button = QPushButton("Підтвердити")
        confirm_button.clicked.connect(lambda: self.check_delete_code(confirm_dialog))
        layout.addWidget(confirm_button)

        # Кнопка "Скасувати"
        cancel_button = QPushButton("Скасувати")
        cancel_button.clicked.connect(confirm_dialog.close)
        layout.addWidget(cancel_button)

        confirm_dialog.setLayout(layout)
        confirm_dialog.exec_()

    def check_delete_code(self, dialog):
        """Перевірка введеного коду для видалення запису"""
        code = self.code_entry.text().strip()
        if code == "ybaciahax":  # Перевіряємо, чи введений код правильний
            dialog.close()
            self.delete_record()  # Викликаємо метод видалення запису
        else:
            QMessageBox.warning(self, "Помилка", "Невірний код підтвердження")

    def setup_styles(self):
        """Налаштування сучасних стилів"""
        self.setStyleSheet(""" 
            QMainWindow {
                background-color: #f0f0f0;
            }
            QLabel {
                font-size: 16px;
                color: #333333;
            }
            QLineEdit {
                font-size: 14px;
                padding: 5px;
                border: 1px solid #cccccc;
                border-radius: 4px;
            }
            QPushButton {
                font-size: 14px;
                padding: 8px 16px;
                background-color: #4CAF50;  /* Зелений колір */
                color: white;
                border: none;
                border-radius: 4px;
            }
            QPushButton:hover {
                background-color: #388E3C;  /* Темно-зелений для ховера */
            }
            QTableWidget, QTableView {
                font-size: 16px;
                border: 1px solid #cccccc;
                selection-background-color: #0078d4;
                selection-color: white;
            }
            QTextEdit {
                font-size: 14px;
                border: 1px solid #cccccc;
                background-color: #ffffff;
            }
        """)

    def create_database(self):
        """Створення бази даних та таблиці"""
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS repairs
                        (id INTEGER PRIMARY KEY AUTOINCREMENT,
                         client_name TEXT NOT NULL,
                         phone TEXT NOT NULL,
                         device_type TEXT NOT NULL,
                         device_model TEXT NOT NULL,
                         brand TEXT NOT NULL,
                         issue TEXT NOT NULL,
                         estimated_price REAL,
                         receipt_date TEXT NOT NULL,
                         return_date TEXT,
                         status TEXT DEFAULT 'Прийнято',
                         notes TEXT,
                         is_diagnostic INTEGER DEFAULT 0,
                         client_message TEXT)''')  # Додано поле is_diagnostic і client_message
            
            # Перевіряємо, чи існують стовпці is_diagnostic та client_message
            c.execute("PRAGMA table_info(repairs)")
            columns = [column[1] for column in c.fetchall()]
            if 'is_diagnostic' not in columns:
                c.execute('ALTER TABLE repairs ADD COLUMN is_diagnostic INTEGER DEFAULT 0')
            if 'client_message' not in columns:
                c.execute('ALTER TABLE repairs ADD COLUMN client_message TEXT')
            
            conn.commit()

    def init_ui(self):
        """Створення елементів інтерфейсу"""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout()  # Основний layout для вертикального розташування
        
        # Зовнішні відступи 
         # Мінімальні зовнішні відступи
        
        input_info_layout = QHBoxLayout()
    
        # Фрейм для введення даних
        input_frame = QWidget()
        input_layout = QVBoxLayout()  # Використовуємо QVBoxLayout для полів вводу
        input_frame.setLayout(input_layout)
   
       
        

        self.create_input_fields(input_layout)

        input_info_layout.addWidget(input_frame)
        self.create_info_panel(input_info_layout)
        main_layout.addLayout(input_info_layout)

        self.create_buttons(main_layout)
        self.create_search_frame(main_layout)
        self.create_table_view(main_layout)

        self.refresh_table()
        central_widget.setLayout(main_layout)

        self.table.selectionModel().selectionChanged.connect(self.on_table_select)
        # Підключення оновлення інформаційного вікна при зміні полів
        self.device_type_entry.currentTextChanged.connect(self.update_ml_display)
        self.brand_entry.currentTextChanged.connect(self.update_ml_display)
        self.issue_entry.editTextChanged.connect(self.update_ml_display)  # Виправлено тут


    def create_input_fields(self, layout):
        """Створення полів введення з оновленим дизайном"""
        fields = [
            ("ІМ'Я КЛІЄНТА:", "name_entry"),
            ("ТЕЛЕФОН:", "phone_entry"),
            ("НЕСПРАВНІСТЬ:", "issue_entry"),
            ("ПОГОДЖЕНА ЦІНА:", "price_entry"),
            ("ТИП ПРИСТРОЮ:", "device_type_entry"),
            ("БРЕНД:", "brand_entry"),
            ("МОДЕЛЬ:", "model_entry"),
            ("ПРИМІТКИ:", "notes_entry")
        ]
        
        # Створення контейнера для полів вводу
        input_container = QWidget()
        input_container_layout = QGridLayout()  # Використовуємо QGridLayout для двох стовпців
        input_container.setLayout(input_container_layout)
        
        # Налаштування відступів між рядками та стовпцями
        input_container_layout.setHorizontalSpacing(10)  # Відступ між стовпцями
        input_container_layout.setVerticalSpacing(15)    # Відступ між рядками
        
        row, col = 0, 0
        
        for label_text, attr_name in fields:
            # Додаємо лейбу
            label = QLabel(label_text)
            label.setFont(QFont('Calibri', 18, QFont.Bold))  # Збільшено розмір тексту
            input_container_layout.addWidget(label, row, col * 2)  # Лейба в першому стовпці
            
            # Додаємо поле вводу
            if attr_name == "phone_entry":
                widget = QLineEdit()
                widget.setPlaceholderText("+380XXXXXXXXX")
                widget.textChanged.connect(self.auto_fill_client_name)  # Підключення обробника події
            else:
                widget = QComboBox()  # Використовуємо QComboBox для випадаючого списку
                widget.setEditable(True)  # Дозволяємо вводити текст
            
            widget.setFont(QFont('Calibri', 15, QFont.Bold))
            widget.setFixedWidth(240)  # Збільшено ширину полів вводу
            widget.setFixedHeight(40)  # Збільшено висоту полів вводу
            
            # Стилізація полів вводу
            widget.setStyleSheet("""
                QLineEdit, QComboBox {
                    background-color: #ffffff;
                    border: 2px solid #bdc3c7;
                    border-radius: 10px;
                    padding: 5px 10px;
                    font-size: 14px;
                    color: #2c3e50;
                }
                QLineEdit:hover, QComboBox:hover {
                    border: 2px solid #3498db;
                }
                QLineEdit:focus, QComboBox:focus {
                    border: 2px solid #2980b9;
                    background-color: #dae7eb;
                }
                QComboBox::drop-down {
                    subcontrol-origin: padding;
                    subcontrol-position: top right;
                    width: 30px;
                    border-left: 1px solid #d5e4ed;
                    border-radius: 0 5px 5px 0;
                }
                QComboBox::down-arrow {
                    image: url(arrow_down.png);  /* Додайте зображення стрілки, якщо потрібно */
                }
            """)
            
            input_container_layout.addWidget(widget, row, col * 2 + 1)  # Поле вводу в другому стовпці
            
            # Зберігаємо віджет у класі
            setattr(self, attr_name, widget)
            
            row += 1
            if row == 4:  # Після 4 рядків переходимо до наступного стовпця
                row = 0
                col += 1
        
        # Обмежуємо ширину контейнера з полями вводу
        input_container.setFixedWidth(800)  # Фіксована ширина
        # Фіксована висота
        
  
        # Додаємо контейнер з полями вводу до основного layout
        layout.addWidget(input_container, alignment=Qt.AlignLeft)  # Вирівнюємо по лівому краю

    def auto_fill_client_name(self):
        """Автоматичне заповнення імені клієнта при введенні номера телефону"""
        phone = self.phone_entry.text().strip()
        if phone:
            with sqlite3.connect('service_center.db') as conn:
                c = conn.cursor()
                c.execute("SELECT client_name FROM repairs WHERE phone = ?", (phone,))
                result = c.fetchone()
                if result:
                    self.name_entry.setCurrentText(result[0]) if isinstance(self.name_entry, QComboBox) else self.name_entry.setText(result[0])

    def create_info_panel(self, layout):
        info_container = QWidget()
        info_layout = QHBoxLayout()
        
        info_container.setLayout(info_layout)

        self.info_label = QTextEdit()
        self.info_label.setReadOnly(True)
        
        self.info_label.setFont(QFont('Segoe UI', 23, QFont.Bold))
        self.info_label.setStyleSheet("""
            QTextEdit {
                background-color: #e6f7ff;
                border: 2px solid #bdc3c7;
                border-radius: 5px;
                padding: 4px;
                color: #34495e;
            }
        """)

        self.ml_info = QTextEdit()
        self.ml_info.setReadOnly(True)
         
        self.ml_info.setFont(QFont('Segoe UI', 22, QFont.Bold))
        self.ml_info.setStyleSheet("""
            QTextEdit {
                background-color: #e6f7ff;
                border: 2px solid #bdc3c7;
                border-radius: 5px;
                padding: 4px;
                color: #34495e;
            }
        """)
        self.ml_info.setHtml("🧠 <i>Введіть дані для отримання прогнозу</i>")

        info_layout.addWidget(self.info_label)
        info_layout.addWidget(self.ml_info)
        

        info_container.setFixedWidth(720)  # Ширина інформаційної панелі (можна змінити за потребою)
        info_container.setFixedHeight(220)
        layout.addWidget(info_container, alignment=Qt.AlignLeft)

    def update_ml_display(self):
        try:
            device_type = self.device_type_entry.currentText().strip()
            brand = self.brand_entry.currentText().strip()
            issue = self.issue_entry.currentText().strip()
            phone = self.phone_entry.text().strip()

            # Перевірка на постійного клієнта
            is_regular = self.is_regular_client(phone)
            discount_text = "🔖 Це наш постійний клієнт!" if is_regular else ""

            if not device_type or not brand:
                self.ml_info.setHtml("🧠 <i>Введіть тип пристрою та бренд для отримання прогнозу</i>")
                return

            # Прогнозування ціни
            predicted_price = self.predict_price()
            
            if predicted_price is None:
                self.ml_info.setHtml("⚠️ <i>Недостатньо даних для прогнозу</i>")
                return

            # Розрахунок середньої ціни для обраного типу пристрою та бренду
            with sqlite3.connect('service_center.db') as conn:
                c = conn.cursor()
                c.execute('''SELECT AVG(estimated_price) 
                            FROM repairs 
                            WHERE device_type = ? AND brand = ? AND estimated_price > 0''', 
                        (device_type, brand))
                avg_price = c.fetchone()[0]

            if avg_price is None:
                avg_price = 0

            # Відображення прогнозованої та середньої ціни
            html = f"""
                <b>⚙️ Автоматичний розрахунок:</b><br>
                ⚠️Ціна визначена штучним інтелектом⚠️</b><br>
                {discount_text}<br>
                ▪ Прогнозована ціна: <b>{predicted_price:.0f} грн</b><br>
                ▪ Середня ціна для:</b><br>
                {device_type} {brand}: <b>{avg_price:.0f} грн</b>
            """
            self.ml_info.setHtml(html)

        except Exception as e:
            self.ml_info.setHtml("⚠️ <i>Помилка розрахунків</i>")

    def create_buttons(self, layout):
        """Створення кнопок з фіксованою шириною та вирівнюванням по лівій стороні"""
        # Створюємо контейнер для повідомлення клієнту
        client_msg_layout = QHBoxLayout()
        client_msg_label = QLabel("Повідомлення для сайту:")
        client_msg_label.setFont(QFont('Segoe UI', 12, QFont.Bold))
        self.client_msg_var = QComboBox()
        self.client_msg_var.setEditable(True)
        self.client_msg_var.addItems(["", "Замовлено запчастини, очікуємо", "Не змогли до вас додзвонитись", "Потрібна додаткова заміна деталі", "Чекаємо вашого рішення", "Готово до видачі"])
        self.client_msg_var.setFont(QFont('Segoe UI', 12))
        client_msg_layout.addWidget(client_msg_label)
        client_msg_layout.addWidget(self.client_msg_var)
        layout.addLayout(client_msg_layout)
        
        button_layout = QHBoxLayout()
        buttons = [
            ("Додати запис", self.add_record, 'primary'),
            ("Оновити статус", self.update_status, 'secondary'),
            ("Друк квитанції", self.generate_receipt, 'secondary'),
            ("Очистити поля", self.clear_entries, 'secondary'),
            ("Редагувати запис", self.edit_record, 'secondary'),
            ("Видалити запис", self.confirm_delete_record, 'secondary'),
            ("Друк акту", self.generate_act_receipt, 'secondary')
        ]
        for text, command, style_name in buttons:
            btn = QPushButton(text)
            btn.setFont(QFont('Segoe UI', 12, QFont.Bold))
            btn.setFixedWidth(170)  # Фіксована ширина кнопок
            btn.setStyleSheet(f""" 
                QPushButton {{ 
                    padding: 10px 5px;
                    background-color: {self.colors[style_name]};
                    color: black;
                    border: none;
                    border-radius: 5px;
                }}
                QPushButton:hover {{ 
                    background-color: {self.colors['accent']};
                }}
            """)
            btn.clicked.connect(command)
            button_layout.addWidget(btn)
        
        # Вирівнювання кнопок по лівій стороні
        button_layout.setAlignment(Qt.AlignLeft)
        layout.addLayout(button_layout)

    def create_search_frame(self, layout):
        """Створення пошукового фрейму з вирівнюванням по лівій стороні"""
        # Головний контейнер для пошуку
        search_container = QWidget()
        search_layout = QHBoxLayout()  # Використовуємо QHBoxLayout для горизонтального розташування
        search_container.setLayout(search_layout)
        
        # Вирівнювання всього контейнера по лівій стороні
        search_layout.setAlignment(Qt.AlignLeft)

        # Поле пошуку за ID
        id_label = QLabel("ID:")
        id_label.setFont(QFont('Calibri', 12))
        search_layout.addWidget(id_label, alignment=Qt.AlignLeft)  # Вирівнюємо лейбу по лівій стороні

        self.id_search_entry = QLineEdit()
        self.id_search_entry.setFont(QFont('Calibri', 12))
        self.id_search_entry.setFixedWidth(100)  # Фіксована ширина поля пошуку за ID
        self.id_search_entry.setStyleSheet("""
            QLineEdit {
                background-color: #ffffff;
                border: 2px solid #bdc3c7;
                border-radius: 10px;
                padding: 5px 10px;
                font-size: 14px;
                color: #2c3e50;
            }
            QLineEdit:hover {
                border: 2px solid #3498db;
            }
            QLineEdit:focus {
                border: 2px solid #2980b9;
                background-color: #ecf0f1;
            }
        """)
        search_layout.addWidget(self.id_search_entry, alignment=Qt.AlignLeft)  # Вирівнюємо поле пошуку по лівій стороні

        # Поле пошуку за ім'ям або телефоном
        search_label = QLabel("Пошук:")
        search_label.setFont(QFont('Calibri', 12))
        search_layout.addWidget(search_label, alignment=Qt.AlignLeft)  # Вирівнюємо лейбу по лівій стороні

        self.search_entry = QLineEdit()
        self.search_entry.setFont(QFont('Calibri', 12))
        self.search_entry.setFixedWidth(200)  # Фіксована ширина поля пошуку
        self.search_entry.setStyleSheet("""
            QLineEdit {
                background-color: #ffffff;
                border: 2px solid #bdc3c7;
                border-radius: 10px;
                padding: 5px 10px;
                font-size: 14px;
                color: #2c3e50;
            }
            QLineEdit:hover {
                border: 2px solid #3498db;
            }
            QLineEdit:focus {
                border: 2px solid #2980b9;
                background-color: #ecf0f1;
            }
        """)
        search_layout.addWidget(self.search_entry, alignment=Qt.AlignLeft)  # Вирівнюємо поле пошуку по лівій стороні

        # Кнопка "Пошук"
        search_button = QPushButton("Пошук")
        search_button.setFont(QFont('Segoe UI', 11, QFont.Bold))
        search_button.setFixedWidth(100)  # Фіксована ширина кнопки пошуку
        search_button.setStyleSheet("""
            QPushButton {
                padding: 8px 16px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
            }
            QPushButton:hover {
                background-color: #388E3C;
            }
        """)
        search_button.clicked.connect(self.search_records)
        search_layout.addWidget(search_button, alignment=Qt.AlignLeft)  # Вирівнюємо кнопку пошуку по лівій стороні

        # Додаємо контейнер пошуку до основного layout
        layout.addWidget(search_container, alignment=Qt.AlignLeft)  # Вирівнюємо весь контейнер пошуку по лівій стороні

    def create_table_view(self, layout):
        """Створення таблиці з оновленим дизайном"""
        self.table = QTableView()
        self.model = CustomTableModel()  # Використовуємо нашу модель
        self.proxy_model = QSortFilterProxyModel()
        self.proxy_model.setSourceModel(self.model)
        self.table.setModel(self.proxy_model)
        
        # Налаштування зовнішнього вигляду таблиці
        self.table.setFont(QFont('Calibri', 16))  # Збільшено розмір тексту
        self.table.setStyleSheet("""
            QTableView {
                background-color: #ffffff;
                border: 1px solid #cccccc;
            }
            QTableView::item {
                padding: 5px;
            }
            QTableView::item:selected {
                background-color: #0078d4;
                color: white;
            }
        """)

        # Налаштування поведінки виділення
        self.table.setSelectionBehavior(QAbstractItemView.SelectRows)
        self.table.setSelectionMode(QAbstractItemView.SingleSelection)
        
        # Налаштування розмірів стовпців
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Interactive)
        self.table.horizontalHeader().setStretchLastSection(True)
        
        # Приховуємо стовпець "Діагностика" (стовпець з індексом 12)
        self.table.setColumnHidden(12, True)
        
        # Додавання таблиці до layout
        layout.addWidget(self.table)
        
        # Підключення обробника вибору рядка
        self.table.selectionModel().selectionChanged.connect(self.on_table_select)

    def update_autocomplete_data(self):
        """Оновлення даних для автодоповнення"""
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            
            queries = {
                'client_name': self.name_entry,
                'brand': self.brand_entry,
                'phone': self.phone_entry,
                'device_type': self.device_type_entry,
                'issue': self.issue_entry,
                'device_model': self.model_entry,
                'notes': self.notes_entry
            }
            
            for field, widget in queries.items():
                c.execute(f'SELECT DISTINCT {field} FROM repairs WHERE {field} IS NOT NULL')
                entries = [row[0] for row in c.fetchall()]
                if isinstance(widget, QComboBox):
                    widget.clear()
                    widget.addItems(entries)
                else:
                    # Реалізація автодоповнення для QLineEdit
                    completer = QCompleter(entries)
                    completer.setCaseSensitivity(Qt.CaseInsensitive)
                    widget.setCompleter(completer)
                    widget.clear()
                    widget.setText("")

    def add_record(self):
        required_fields = [
            (self.name_entry, "ім'я клієнта"),
            (self.phone_entry, "телефон"),
            (self.device_type_entry, "тип пристрою"),
            (self.brand_entry, "бренд"),
            (self.issue_entry, "несправність")
        ]
        
        for field, name in required_fields:
            value = field.currentText().strip() if isinstance(field, QComboBox) else field.text().strip()
            if not value:
                QMessageBox.warning(self, "Помилка", f"Будь ласка, заповніть поле '{name}'")
                return
        
        # Видалено автоматичне прогнозування ціни
        # if self.ml_model.ml_initialized:
        #     price_text = self.price_entry.currentText().strip() if isinstance(self.price_entry, QComboBox) else self.price_entry.text().strip()
        #     if not price_text:
        #         predicted = self.predict_price()
        #         if predicted:
        #             self.price_entry.setCurrentText(f"{predicted:.2f}") if isinstance(self.price_entry, QComboBox) else self.price_entry.setText(f"{predicted:.2f}")

        # Отримуємо текст ціни з віджета
        price_text = self.price_entry.currentText().strip() if isinstance(self.price_entry, QComboBox) else self.price_entry.text().strip()
        
        is_diagnostic = 0
        if not price_text:
            price_dialog = QDialog(self)
            price_dialog.setWindowTitle("Ціна діагностики")
            price_dialog.setGeometry(100, 100, 300, 150)
            layout = QVBoxLayout()
            
            price_label = QLabel("Введіть ціну діагностики (мінімум 300 грн):")
            layout.addWidget(price_label)
            
            price_input = QLineEdit()
            price_input.setValidator(QDoubleValidator(300, 9999, 2))
            layout.addWidget(price_input)
            
            ok_button = QPushButton("OK")
            ok_button.clicked.connect(price_dialog.accept)
            layout.addWidget(ok_button)
            
            price_dialog.setLayout(layout)
            
            if price_dialog.exec_() == QDialog.Accepted:
                price_text = price_input.text().strip()
                if not price_text:
                    price_text = "300"
                is_diagnostic = 1
            else:
                return
        
        try:
            price = float(price_text)
        except ValueError:
            QMessageBox.warning(self, "Помилка", "Будь ласка, введіть коректну ціну")
            return
        
        client_name = self.format_client_name(self.name_entry.currentText() if isinstance(self.name_entry, QComboBox) else self.name_entry.text())
        device_type = self.format_general_text(self.device_type_entry.currentText() if isinstance(self.device_type_entry, QComboBox) else self.device_type_entry.text())
        brand = self.format_brand(self.brand_entry.currentText() if isinstance(self.brand_entry, QComboBox) else self.brand_entry.text())
        issue = self.format_general_text(self.issue_entry.currentText() if isinstance(self.issue_entry, QComboBox) else self.issue_entry.text())
        notes = self.format_general_text(self.notes_entry.currentText() if isinstance(self.notes_entry, QComboBox) else self.notes_entry.text())
        
        if is_diagnostic:
            notes = "ДІАГНОСТИКА , " + (notes if notes else "")
        
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute('''INSERT INTO repairs 
                        (client_name, phone, device_type, device_model, brand,
                        issue, estimated_price, receipt_date, status, notes, is_diagnostic, client_message)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''', ((
                client_name,
                self.phone_entry.text(),
                device_type,
                self.model_entry.currentText() if isinstance(self.model_entry, QComboBox) else self.model_entry.text(),
                brand,
                issue,
                price,
                QDateTime.currentDateTime().toString('yyyy-MM-dd HH:mm'),
                "Прийнято",
                notes,
                is_diagnostic,
                self.client_msg_var.currentText()
            )))
            conn.commit()
            last_id = c.lastrowid
            self.sync_to_firebase(last_id)
        
        self.update_autocomplete_data()
        self.clear_entries()
        self.refresh_table()
        QMessageBox.information(self, "Успіх", "Запис додано успішно")
        self.select_last_added_record(last_id)
        self.generate_receipt()

        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM repairs")
            count = c.fetchone()[0]
            
        if count % 10 == 0:
            self.retrain_model()

    def select_last_added_record(self, record_id):
        """Вибір останнього доданого запису в таблиці"""
        for row in range(self.table.model().rowCount()):
            if self.table.model().data(self.table.model().index(row, 0)) == str(record_id):
                self.table.selectRow(row)
                break

    def refresh_table(self):
        """Оновлення таблиці"""
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute('SELECT * FROM repairs ORDER BY receipt_date DESC')
            records = c.fetchall()
        
        self.update_table_view(records)

    def clear_entries(self):
        """Очистка полей введення"""
        for entry in [self.name_entry, self.phone_entry, self.device_type_entry, self.model_entry, self.brand_entry, self.issue_entry, self.price_entry, self.notes_entry]:
            if isinstance(entry, QComboBox):
                entry.setCurrentIndex(-1)
            else:
                entry.clear()
        self.client_msg_var.setCurrentIndex(0)

    def print_receipt(self, receipt_content: str, url: str = None) -> None:
        """Відправка квитанції на принтер через win32print"""
        try:
            # Отримуємо ім'я принтера за замовчуванням
            printer_name = win32print.GetDefaultPrinter()
            
            # Створюємо контекст принтера
            hdc = win32ui.CreateDC()
            hdc.CreatePrinterDC(printer_name)
            
            # Починаємо документ
            hdc.StartDoc("Квитанція")
            hdc.StartPage()
            
            # Встановлюємо початкову позицію для тексту
            y_position = 10  # Початкова позиція по вертикалі (у точках)
            
            # Друкуємо кожен рядок квитанції
            for line in receipt_content.split('\n'):
                if line.strip():  # Ігноруємо порожні рядки
                    hdc.TextOut(3, y_position, line)  # 100 - відступ зліва
                    y_position += 40  # Збільшуємо позицію для наступного рядка
            
            # Додаємо QR код, якщо передано URL
            if url:
                try:
                    import qrcode
                    from PIL import ImageWin
                    
                    y_position += 20
                    hdc.TextOut(3, y_position, "Перевірити статус ремонту (відскануйте):")
                    y_position += 40
                    
                    # Генеруємо QR-код 
                    # Збільшено box_size до 8 для кращого читання
                    qr = qrcode.QRCode(version=1, box_size=8, border=1)
                    qr.add_data(url)
                    qr.make(fit=True)
                    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
                    
                    dib = ImageWin.Dib(img)
                    width, height = img.size
                    dib.draw(hdc.GetHandleOutput(), (10, y_position, 10 + width, y_position + height))
                    y_position += height + 20
                except Exception as qr_err:
                    print(f"QR Error: {qr_err}")
            
            # Завершуємо сторінку та документ
            hdc.EndPage()
            hdc.EndDoc()
            
            # Звільняємо ресурси
            hdc.DeleteDC()
        except Exception as e:
            QMessageBox.critical(self, "Помилка", f"Сталася помилка при друку: {str(e)}")

    def generate_act_receipt(self):
        """Генерація акту виконаних робіт"""
        selected = self.table.selectionModel().selectedRows()
        if not selected:
            QMessageBox.warning(self, "Помилка", "Виберіть запис для друку акту")
            return
        
        index = selected[0].row()
        item_id = self.table.model().data(self.table.model().index(index, 0))
        
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute('SELECT client_name, phone, device_type, brand, device_model, issue, estimated_price, notes FROM repairs WHERE id = ?', (item_id,))
            record = c.fetchone()
            
        if not record:
            return
            
        client_name, phone, dev_type, brand, model, issue, price, notes = record
        
        act_content = f"""
        TEXNO PLUS
        АКТ ВИКОНАНИХ РОБІТ
===================================
Клієнт: {client_name}
Телефон: {phone}
Пристрій: {dev_type} {brand} {model}
Несправність: {issue}
===================================
ВИКОНАНІ РОБОТИ / ЗАМІНЕНІ ДЕТАЛІ:
{notes if notes else 'Не вказано'}
===================================
До сплати: {price} грн
Гарантія на виконані роботи: 30 днів
Дякуємо, що обрали наш сервіс!
Дата: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}
===================================
"""
        # Створення вікна попереднього перегляду акту
        preview_window = QDialog(self)
        preview_window.setWindowTitle("Попередній перегляд акту")
        preview_window.setGeometry(100, 100, 400, 500)
        
        layout = QVBoxLayout()
        text_edit = QTextEdit()
        text_edit.setText(act_content)
        layout.addWidget(text_edit)
        
        button_layout = QHBoxLayout()
        print_button = QPushButton("Друк акту")
        print_button.clicked.connect(lambda: self.print_receipt(text_edit.toPlainText()))
        button_layout.addWidget(print_button)
        layout.addLayout(button_layout)
        
        preview_window.setLayout(layout)
        preview_window.exec_()

    def generate_receipt(self):
        """Генерація квитанції"""
        selected = self.table.selectionModel().selectedRows()
        if not selected:
            QMessageBox.warning(self, "Помилка", "Виберіть запис для друку квитанції")
            return
        
        index = selected[0].row()
        values = [self.table.model().data(self.table.model().index(index, i)) for i in range(self.table.model().columnCount())]
        
        # Отримуємо значення is_diagnostic з бази даних
        item_id = values[0]  # ID запису
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute('SELECT is_diagnostic FROM repairs WHERE id = ?', (item_id,))
            is_diagnostic = c.fetchone()[0]  # Отримуємо значення is_diagnostic
        
        # Додаємо is_diagnostic до списку values
        values.append(is_diagnostic)
        
        receipt_content = self.format_receipt(values)
        
        # Створення вікна попереднього перегляду
        preview_window = QDialog(self)
        preview_window.setWindowTitle("Попередній перегляд квитанції")
        preview_window.setGeometry(100, 100, 400, 600)
        layout = QVBoxLayout()
        
        # Текстова область для квитанції
        text_widget = QTextEdit()
        text_widget.setReadOnly(True)
        text_widget.setFont(QFont('Courier', 10))
        text_widget.setPlainText(receipt_content)
        layout.addWidget(text_widget)
        
        # Формуємо URL для QR-коду
        phone = str(values[2]) if values[2] else ""
        clean_phone = ''.join(filter(str.isdigit, phone))
        phone_last4 = clean_phone[-4:] if len(clean_phone) >= 4 else "0000"
        status_url = f"https://texno.plus/status?id={item_id}&phone={phone_last4}"
        
        # Кнопка "Друк квитанції"
        print_button = QPushButton("Друк квитанції")
        print_button.setFont(QFont('Segoe UI', 11, QFont.Bold))
        print_button.setStyleSheet("""
            QPushButton {
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
            }
            QPushButton:hover {
                background-color: #45a049;
            }
        """)
        print_button.clicked.connect(lambda: self.print_receipt(receipt_content, status_url))  # Виклик функції друку з URL
        layout.addWidget(print_button)
        
        # Кнопка "Закрити"
        close_button = QPushButton("Закрити")
        close_button.setFont(QFont('Segoe UI', 11, QFont.Bold))
        close_button.setStyleSheet("""
            QPushButton {
                padding: 10px 20px;
                background-color: #f44336;
                color: white;
                border: none;
                border-radius: 4px;
            }
            QPushButton:hover {
                background-color: #d32f2f;
            }
        """)
        close_button.clicked.connect(preview_window.close)  # Закриття вікна
        layout.addWidget(close_button)
        
        preview_window.setLayout(layout)
        preview_window.exec_()

    def format_receipt(self, values):
        """Форматування тексту квитанції"""
        # Визначаємо, чи це діагностика
        is_diagnostic = values[12]  # is_diagnostic знаходиться на 12-му індексі
        
        return f"""===================================
    КВИТАНЦІЯ ПРО ПРИЙОМ
    С.Ц. ТЕХНОПЛЮС
    тел: 067-385-15-60
===================================
Номер договору: {values[0]}
Дата прийому: {values[8]}
===================================
ІНФОРМАЦІЯ КЛІЄНТА

Клієнт: {values[1]}
Телефон: +38{values[2]}
===================================
ІНФОРМАЦІЯ ПРО ПРИСТРІЙ

Тип: {values[3]}
Бренд: {values[5]}
Модель: {values[4]}
===================================
ОПИС НЕСПРАВНОСТІ

{values[6]}
===================================
ВАРТІСТЬ ТА ПРИМІТКИ

{'Діагностика вартість' if is_diagnostic  else 'Орієнтовна ціна від'}: {values[7]} грн
Примітка:
{values[11] if values[11] else 'Немає'}
===================================
.
М.П. Техноплюс: ___________________
.
Я {values[1]} розумію, що: 
{values[3]}-{values[5]}
зданий(а) в ремонт є вживаний(а) і має
сліди використання, а також може
містити приховані дефекти про
які не можливо дізнатись без
діагностити чи спецобладнання.
Тому ПОГОДЖУЮСЬ з тим, що після 
ремонту чи діагностики характеристики
приладу можуть погіршитись або 
його працездатність може бути втрачена 
на завжди. Остаточна ціна ремонту 
буде зі мною погоджена, якщо буде 
більшою ніж в цій квитанції.
Зобов'язуюсь СПЛАТИТИ діагностику в
разі відмови мною від ремонту.
Якщо я не вийду на звязок протягом
60 днів то сервіс може утилізувати
{values[3]}-{values[5]}.
Тому після вказаного терміну у мене
не винекне жодних претензій щодо:
{values[3]}-{values[5]}. 

===================================

Дата: {datetime.datetime.now().strftime('%Y-%m-%d')}
===================================
"""

    def update_status(self):
        """Оновлення статусу ремонту"""
        selected = self.table.selectionModel().selectedRows()
        if not selected:
            QMessageBox.warning(self, "Помилка", "Виберіть запис для оновлення статусу")
            return
        
        index = selected[0].row()
        item_id = self.table.model().data(self.table.model().index(index, 0))
        self.create_update_window(item_id)

    def create_update_window(self, item_id):
        """Створення вікна оновлення статусу"""
        update_window = QDialog(self)
        update_window.setWindowTitle("Оновити статус")
        update_window.setGeometry(100, 100, 300, 500)
        layout = QVBoxLayout()
        status_var = QComboBox()
        status_var.addItems(["Очікує запчастин", "Узгодити ціну", "Готово", "Видано", "Без ремонту", "В ремонті", "На погодженні"])
        widgets = [
            ("Новий статус:", status_var),
            ("Телефон:", QLineEdit()),
            ("Несправність:", QLineEdit()),
            ("Орієнтована ціна:", QLineEdit()),
            ("Примітка:", QLineEdit())
        ]
        for i, (label_text, widget) in enumerate(widgets):
            label = QLabel(label_text)
            layout.addWidget(label)
            layout.addWidget(widget)
        # Заповнення поточними даними
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute('''SELECT status, phone, issue, estimated_price, notes 
                        FROM repairs WHERE id = ?''', (item_id,))
            current_data = c.fetchone()
        
        if current_data:
            status_var.setCurrentText(current_data[0])
            for widget, value in zip([w[1] for w in widgets[1:]], current_data[1:]):  # Змінив на 1: для виключення статусу
                if value is not None:
                    widget.setText(str(value))
        
        # Кнопка збереження
        button_layout = QHBoxLayout()
        save_button = QPushButton("Зберегти")
        save_button.clicked.connect(lambda: self.save_status_update(item_id, status_var, widgets, update_window))
        button_layout.addWidget(save_button)
        layout.addLayout(button_layout)
        update_window.setLayout(layout)
        update_window.exec_()

    def save_status_update(self, item_id, status_var, widgets, window):
        """Збереження оновленого статусу"""
        try:
            # Отримуємо значення ціни з віджета
            price_widget = widgets[3][1]  # widgets[3] — це кортеж (label, widget)
            price_text = price_widget.text().strip() if hasattr(price_widget, 'text') else price_widget.currentText().strip()
            price = float(price_text) if price_text else 0
        except ValueError:
            QMessageBox.warning(self, "Помилка", "Будь ласка, введіть коректну ціну")
            return
        
        # Отримуємо поточний статус
        new_status = status_var.currentText()
        
        # Якщо статус змінюється на "Готово" або "Видано", встановлюємо поточну дату як дату повернення
        if new_status in ["Готово", "Видано"]:
            return_date = QDateTime.currentDateTime().toString('yyyy-MM-dd HH:mm')
        else:
            return_date = None  # Якщо статус не "Готово" або "Видано", залишаємо дату повернення без змін
        
        # Якщо статус змінюється на "Готово", встановлюємо is_diagnostic на 0
        is_diagnostic = 0 if new_status == "Готово" else None
        
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            if is_diagnostic is not None:
                c.execute('''UPDATE repairs 
                            SET status = ?, phone = ?, issue = ?, estimated_price = ?, notes = ?, is_diagnostic = ?, return_date = ?
                            WHERE id = ?''', (
                    new_status,
                    widgets[1][1].text(),  # Отримуємо текст з QLineEdit або QComboBox
                    widgets[2][1].text(),
                    price,
                    widgets[4][1].text(),
                    is_diagnostic,
                    return_date,
                    item_id
                ))
            else:
                c.execute('''UPDATE repairs 
                            SET status = ?, phone = ?, issue = ?, estimated_price = ?, notes = ?, return_date = ?
                            WHERE id = ?''', (
                    new_status,
                    widgets[1][1].text(),  # Отримуємо текст з QLineEdit або QComboBox
                    widgets[2][1].text(),
                    price,
                    widgets[4][1].text(),
                    return_date,
                    item_id
                ))
            conn.commit()
            self.sync_to_firebase(item_id)
        
        self.update_autocomplete_data()
        self.refresh_table()
        window.close()
        QMessageBox.information(self, "Успіх", "Статус оновлено успішно")

    def search_records(self):
        """Пошук записів"""
        search_term = self.search_entry.text().strip()
        id_term = self.id_search_entry.text().strip()

        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            
            if id_term:
                c.execute('SELECT * FROM repairs WHERE id = ?', (id_term,))
            elif search_term:
                c.execute('''SELECT * FROM repairs 
                            WHERE client_name LIKE ? OR phone LIKE ?''',
                    (f'%{search_term}%', f'%{search_term}%'))
            else:
                c.execute('SELECT * FROM repairs ORDER BY receipt_date DESC')
            
            records = c.fetchall()

        self.update_table_view(records)

    def update_table_view(self, records):
        """Оновлення даних в таблиці"""
        self.model = CustomTableModel(records)
        self.proxy_model.setSourceModel(self.model)
        self.table.setModel(self.proxy_model)
        self.table.resizeColumnsToContents()

    def on_table_select(self):
        """Обробка вибору рядка в таблиці"""
        selected = self.table.selectionModel().selectedRows()
        if selected:
            index = selected[0].row()
            values = [self.table.model().data(self.table.model().index(index, i)) for i in range(self.table.model().columnCount())]
            if values:
                item_id = values[0]
                # Форматуємо телефон у вигляді (380) 687-58-96
                phone = str(values[2])
                if phone.isdigit() and len(phone) == 10:
                    formatted_phone = f"({phone[:3]}) {phone[3:6]}-{phone[6:8]}-{phone[8:]}"
                else:
                    formatted_phone = phone  # Якщо номер не відповідає формату, залишаємо як є
                
                # Fetch client_message directly from DB since it's not in the main table view
                with sqlite3.connect('service_center.db') as conn:
                    c = conn.cursor()
                    c.execute('SELECT client_message FROM repairs WHERE id = ?', (item_id,))
                    msg_res = c.fetchone()
                    client_msg = msg_res[0] if msg_res and msg_res[0] else ""
                    self.client_msg_var.setCurrentText(client_msg)
                
                info_text = f"""
    Клієнт: {values[1]}
    Телефон: {formatted_phone}
    Пристрій: {values[3]}
    Бренд: {values[5]}
    Несправність: {values[6]}
    Вартість: {values[7]} грн.
    Примітка (роботи): {values[11]}
    Повідомлення на сайт: {client_msg}"""
                
                self.info_label.setText(info_text.strip())
                
                # Оновлення прогнозованої ціни
                self.device_type_entry.setCurrentText(values[3])
                self.brand_entry.setCurrentText(values[5])
                self.issue_entry.setCurrentText(values[6])  # Виправлено тут
                self.update_ml_display()
            else:
                self.info_label.setText("Виберіть запис для відображення деталей")
        else:
            self.info_label.setText("Виберіть запис для відображення деталей")

    def edit_record(self):
        """Редагування запису"""
        selected = self.table.selectionModel().selectedRows()
        if not selected:
            QMessageBox.warning(self, "Помилка", "Виберіть запис для редагування")
            return
        
        index = selected[0].row()
        item_id = self.table.model().data(self.table.model().index(index, 0))
        self.create_edit_window(item_id)

    def create_edit_window(self, item_id):
        """Створення вікна редагування"""
        edit_window = QDialog(self)
        edit_window.setWindowTitle("Редагувати запис")
        edit_window.setGeometry(100, 100, 300, 500)
        layout = QVBoxLayout()
        fields = [
            ("Ім'я клієнта:", QLineEdit()),
            ("Телефон:", QLineEdit()),
            ("Несправність:", QLineEdit()),
            ("Орієнтована ціна:", QLineEdit()),
            ("Тип пристрою:", QLineEdit()),
            ("Бренд:", QLineEdit()),
            ("Модель:", QLineEdit()),
            ("Примітка:", QLineEdit()),
            ("Повід. для сайту:", QLineEdit())
        ]
        for label_text, widget in fields:
            label = QLabel(label_text)
            layout.addWidget(label)
            layout.addWidget(widget)
        # Заповнення поточними даними
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute('''SELECT client_name, phone, issue, estimated_price, device_type, brand, device_model, notes, client_message
                        FROM repairs WHERE id = ?''', (item_id,))
            current_data = c.fetchone()
        
        if current_data:
            for widget, value in zip([w[1] for w in fields], current_data):
                if value is not None:
                    widget.setText(str(value))
        
        # Кнопка збереження
        button_layout = QHBoxLayout()
        save_button = QPushButton("Зберегти")
        save_button.clicked.connect(lambda: self.save_edit_record(item_id, fields, edit_window))
        button_layout.addWidget(save_button)
        layout.addLayout(button_layout)
        edit_window.setLayout(layout)
        edit_window.exec_()

    def save_edit_record(self, item_id, fields, window):
        """Збереження редагованого запису"""
        try:
            price = float(fields[3][1].text()) if fields[3][1].text().strip() else 0
        except ValueError:
            QMessageBox.warning(self, "Помилка", "Будь ласка, введіть коректну ціну")
            return
        
        # Форматуємо дані перед збереженням
        client_name = self.format_client_name(fields[0][1].text())
        device_type = self.format_general_text(fields[4][1].text())
        brand = self.format_brand(fields[5][1].text())
        issue = self.format_general_text(fields[2][1].text())
        notes = self.format_general_text(fields[7][1].text())
        client_message = fields[8][1].text()
        
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute('''UPDATE repairs 
                        SET client_name = ?, phone = ?, issue = ?, estimated_price = ?, device_type = ?, brand = ?, device_model = ?, notes = ?, client_message = ?
                        WHERE id = ?''', ((
                client_name,
                fields[1][1].text(),
                issue,
                price,
                device_type,
                brand,
                fields[6][1].text(),
                notes,
                client_message,
                item_id
            )))
            conn.commit()
            self.sync_to_firebase(item_id)
        
        self.update_autocomplete_data()
        self.refresh_table()
        window.close()
        QMessageBox.information(self, "Успіх", "Запис відредагувано успішно")

    def delete_record(self):
        """Видалення запису"""
        selected = self.table.selectionModel().selectedRows()
        if not selected:
            QMessageBox.warning(self, "Помилка", "Виберіть запис для видалення")
            return
        
        index = selected[0].row()
        item_id = self.table.model().data(self.table.model().index(index, 0))
        with sqlite3.connect('service_center.db') as conn:
            c = conn.cursor()
            c.execute('''DELETE FROM repairs WHERE id = ?''', (item_id,))
            conn.commit()
            self.delete_from_firebase(item_id)
        
        self.update_autocomplete_data()
        self.refresh_table()
        QMessageBox.information(self, "Успіх", "Запис видалено успішно")



    def backup_database(self):
        """Резервне копіювання бази даних"""
        backup_file, _ = QFileDialog.getSaveFileName(self, "Зберегти резервну копію", "", "SQLite Database (*.db)")
        if backup_file:
            try:
                shutil.copyfile('service_center.db', backup_file)
                QMessageBox.information(self, "Успіх", "База даних успішно резервована")
            except Exception as e:
                QMessageBox.critical(self, "Помилка", f"Сталася помилка при резервному копіюванні: {e}")

    def restore_database(self):
        """Відновлення бази даних з резервної копії"""
        restore_file, _ = QFileDialog.getOpenFileName(self, "Вибрати резервну копію", "", "SQLite Database (*.db)")
        if restore_file:
            try:
                shutil.copyfile(restore_file, 'service_center.db')
                QMessageBox.information(self, "Успіх", "База даних успішно відновлена")
                self.refresh_table()
            except Exception as e:
                QMessageBox.critical(self, "Помилка", f"Сталася помилка при відновленні: {e}")

def main():
    app = QApplication(sys.argv)
    window = ModernServiceCenterApp()
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()