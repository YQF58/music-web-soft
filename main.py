import sys
import os
from PyQt5.QtCore import QUrl, Qt
from PyQt5.QtWidgets import (QApplication, QMainWindow, QProgressBar,
                             QLabel, QVBoxLayout, QWidget,
                             QSystemTrayIcon, QMenu, QMessageBox)
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtGui import QIcon

class LoadingScreen(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("加载中...")
        self.setFixedSize(300, 100)
        self.setWindowFlags(Qt.WindowStaysOnTopHint | Qt.CustomizeWindowHint)

        layout = QVBoxLayout()
        self.label = QLabel("正在加载 YQF 音乐盒，请稍等...")
        self.progress = QProgressBar()
        self.progress.setAlignment(Qt.AlignCenter)
        
        layout.addWidget(self.label)
        layout.addWidget(self.progress)
        self.setLayout(layout)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.set_application_icon()
        self.initUI()
        self.initWebView()
        self.initLoadingScreen()
        self.initTrayIcon()

    def set_application_icon(self):
        """设置应用图标"""
        icon_path = "icon.ico"
        if os.path.exists(icon_path):
            app_icon = QIcon(icon_path)
            QApplication.setWindowIcon(app_icon)
        else:
            print(f"警告: 图标文件 {icon_path} 不存在")

    def initUI(self):
        self.setWindowTitle("YQF 音乐盒")
        self.setGeometry(100, 100, 1280, 720)
        self.centerWidget = QWidget()
        self.setCentralWidget(self.centerWidget)
        self.hide()  # 初始隐藏主窗口

    def initWebView(self):
        layout = QVBoxLayout()
        self.webview = QWebEngineView()
        layout.addWidget(self.webview)
        self.centerWidget.setLayout(layout)

    def initLoadingScreen(self):
        self.loading_screen = LoadingScreen()
        self.webview.loadStarted.connect(self.showLoadingScreen)
        self.webview.loadProgress.connect(self.updateProgress)
        self.webview.loadFinished.connect(self.hideLoadingScreen)

    def initTrayIcon(self):
        # 创建系统托盘图标
        self.tray_icon = QSystemTrayIcon(self)
        if QIcon.themeName():
            self.tray_icon.setIcon(QIcon.fromTheme("audio-player"))

        # 优先使用自定义图标
        icon_path = "icon.ico"
        if os.path.exists(icon_path):
            self.tray_icon.setIcon(QIcon(icon_path))

        # 创建托盘菜单
        tray_menu = QMenu()
        show_action = tray_menu.addAction("显示主界面")
        show_action.triggered.connect(self.show_normal)
        tray_menu.addSeparator()
        quit_action = tray_menu.addAction("退出程序")
        quit_action.triggered.connect(self.quit_app)

        self.tray_icon.setContextMenu(tray_menu)
        self.tray_icon.activated.connect(self.tray_icon_clicked)
        self.tray_icon.show()

    def show_normal(self):
        self.show()
        self.activateWindow()
        self.setWindowState(Qt.WindowActive)

    def quit_app(self):
        self.tray_icon.hide()
        QApplication.quit()

    def tray_icon_clicked(self, reason):
        if reason == QSystemTrayIcon.DoubleClick:
            self.show_normal()

    def closeEvent(self, event):
        """拦截关闭事件，最小化到托盘"""
        if self.isVisible():
            event.ignore()
            self.hide()
            self.tray_icon.showMessage(
                "提示", 
                "程序已最小化到系统托盘",
                QSystemTrayIcon.Information, 2000
            )
        else:
            event.accept()

    def showLoadingScreen(self):
        self.loading_screen.show()
        self.loading_screen.progress.setValue(0)

    def updateProgress(self, progress):
        self.loading_screen.progress.setValue(progress)

    def hideLoadingScreen(self, success):
        self.loading_screen.hide()
        if success:
            self.show()
        else:
            self.tray_icon.showMessage(
                "错误", 
                "网页加载失败，请检查网络连接",
                QSystemTrayIcon.Critical, 5000
            )
            self.webview.setHtml("<h1>加载失败，请检查网络连接</h1>")

    def loadUrl(self):
        self.webview.load(QUrl("https://music.imyqf.cn"))

if __name__ == "__main__":
    app = QApplication(sys.argv)

    # 检查系统托盘支持
    if not QSystemTrayIcon.isSystemTrayAvailable():
        QMessageBox.critical(None, "错误", "系统不支持托盘图标")
        sys.exit(1)

    app.setApplicationName("YQF音乐盒")

    window = MainWindow()
    window.loadUrl()
    sys.exit(app.exec_())
