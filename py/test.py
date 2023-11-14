import pyautogui

# 获取屏幕的宽度和高度
screen_width, screen_height = pyautogui.size()

# 设置鼠标移动的目标坐标
target_x = 606
target_y = 80

# 移动鼠标到目标坐标
pyautogui.moveTo(target_x, target_y, duration=1)  # duration参数表示移动的时间，单位是秒
pyautogui.click()  

# 你也可以通过获取当前鼠标位置来进行相对移动
# current_x, current_y = pyautogui.position()
# pyautogui.moveTo(current_x + 100, current_y + 100, duration=1)
