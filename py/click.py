import pydirectinput
pydirectinput.moveTo(100, 150) # 移动鼠标至坐标100，150
pydirectinput.click() # 点击鼠标左键
# pydirectinput.click(200, 220) # 移动鼠标至坐标200，220，并点击左键
# pydirectinput.move(None, 10)  # 鼠标移动相对y位置
# pydirectinput.doubleClick() # 双击鼠标左键
# pydirectinput.press('esc') # 按一下esc
# pydirectinput.keyDown('shift')#按下shift
# pydirectinput.keyUp('shift')#弹起shift
 
def mouse_click_handle(x=500, y=500):
    pydirectinput.moveTo(x, y, duration=0.5)
    pydirectinput.click()


if __name__ == "__main__":
   mouse_click_handle()

