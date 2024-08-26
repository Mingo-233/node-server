
module.exports = function useQueue() {
    const createQueue = () => ({
        tasks: [],
        processing: false,
    });
    const queue = createQueue();

    // 添加任务的纯函数
    const addTask = (task) => {
        queue.tasks.push(task);
    };

    // 处理任务的纯函数
    const processTasks = async () => {
        try {
            if (queue.processing || queue.tasks.length === 0) return
            queue.processing = true
            const taskFn = queue.tasks.shift()
            await taskFn();
            queue.processing = false
            processTasks()
        } catch (error) {
            console.error('processTasks 出错了');
            console.error(error);
            clearTasks()
        }


    };

    // 清除任务的纯函数
    const clearTasks = () => {
        queue.tasks = [];
        queue.processing = false;
        return queue
    };
    return {
        addTask,
        processTasks,
    }
}

