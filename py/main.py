import pyautogui
import time
import asyncio
num = 1

mouse_positions = {
    'scarecrowOne': {'x': 598, 'y': 339},
    'talkOptionsFirst': {'x': 500, 'y': 500},
    'talkOptionsSecond': {'x': 500, 'y': 500},
    'collectAreaOne': [{'x': 500, 'y': 500}, {'x': 500, 'y': 500}, {'x': 500, 'y': 500}, {'x': 500, 'y': 500}],
    'goodsPick': {'x': 900, 'y': 500},
}

wait_time = {
    'collect': 1,
    'grow': 60 * 5 + 1,
    'delayStart': 3,
}

def get_area_color():
    width, height = pyautogui.size()
    x, y = 900, 500
    color = pyautogui.pixel(x, y)
    print(f"颜色值：#{color}")

def mouse_click_handle(x=500, y=500):
    pyautogui.moveTo(x, y, duration=0.5)
    pyautogui.click()

class ExecuteAction:
    def __init__(self):
        self.current = 0
        self.value = {'x': 500, 'y': 500}

    def set_value(self):
        self.value = mouse_positions['scarecrowOne']

    def add(self):
        self.current += 1

    def clear(self):
        self.current = 0

    def do(self):
        mouse_click_handle(self.value['x'], self.value['y'])

execute_action = ExecuteAction()

async def touch_npc(log=True):
    execute_action.set_value()
    execute_action.do()
    mouse_click_handle(mouse_positions['talkOptionsFirst']['x'], mouse_positions['talkOptionsFirst']['y'])
    time.sleep(0.5)
    mouse_click_handle(mouse_positions['talkOptionsSecond']['x'], mouse_positions['talkOptionsSecond']['y'])
    if log:
        log_recorder('npc task done, start plant task')

async def collect_goods(log=True):
    current_land = execute_action.current
    current_area = mouse_positions['collectAreaOne']
    for area_position in current_area:
        mouse_click_handle(area_position['x'], area_position['y'])
        time.sleep(wait_time['collect'])
        mouse_click_handle(mouse_positions['goodsPick']['x'], mouse_positions['goodsPick']['y'])
    if log:
        log_recorder('collect goods task done')

async def main():
    try:
        log_recorder(f'task start, current time: {time.strftime("%Y-%m-%d %H:%M:%S")}')
        time.sleep(wait_time['delayStart'])
        log_recorder(f'current num: {num}')
        await touch_npc()
        time.sleep(wait_time['grow'])
        await collect_goods()
        time.sleep(2)
        main()
    except Exception as error:
        log_recorder(error, True)

def log_recorder(message, is_error=False):
    with open('log.txt', 'a') as file:
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {'[ERROR]' if is_error else ''} {message}\n"
        print(log_entry, end='')  # 打印到控制台
        file.write(log_entry)  # 写入日志文件

if __name__ == "__main__":
    asyncio.run(main())
