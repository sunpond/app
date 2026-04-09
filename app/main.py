import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from PySide6.QtWidgets import QApplication
from app.gui.main_window import MainWindow

def main():
    app = QApplication(sys.path)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
