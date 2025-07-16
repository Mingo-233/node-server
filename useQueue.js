
module.exports = function useQueue() {
    const createQueue = () => ({
        tasks: [],
        processing: false,
    });
    const queue = createQueue();

    // 添加任务的纯函数
    const addTask = (task) => {
        try {
            if (typeof task !== 'function') {
                console.error('添加任务失败: 任务必须是一个函数')
                return false
            }
            queue.tasks.push(task);
            console.log(`任务已添加，当前队列长度: ${queue.tasks.length}`)
            return true
        } catch (error) {
            console.error('添加任务时发生错误:', error.message)
            return false
        }
    };

    // 处理任务的纯函数
    const processTasks = async () => {
        try {
            if (queue.processing || queue.tasks.length === 0) {
                return
            }
            
            queue.processing = true
            console.log(`开始处理任务，队列中还有 ${queue.tasks.length} 个任务`)
            
            const taskFn = queue.tasks.shift()
            
            // 使用Promise.resolve包装任务，确保即使是同步函数也能正确处理
            await Promise.resolve(taskFn()).catch(error => {
                console.error('任务执行失败:', error.message)
                console.error('错误堆栈:', error.stack)
            })
            
            queue.processing = false
            
            // 如果还有任务，继续处理
            if (queue.tasks.length > 0) {
                console.log(`任务完成，继续处理下一个任务。剩余: ${queue.tasks.length}`)
                // 使用 setImmediate 避免递归调用栈过深
                setImmediate(() => processTasks())
            } else {
                console.log('所有任务处理完成')
            }
            
        } catch (error) {
            console.error('处理任务队列时发生严重错误:', error.message)
            console.error('错误堆栈:', error.stack)
            
            // 重置队列状态，避免队列被永久阻塞
            queue.processing = false
            
            // 清除当前所有任务，防止错误任务重复执行
            const failedTasksCount = queue.tasks.length
            clearTasks()
            console.error(`已清除 ${failedTasksCount} 个任务，队列已重置`)
        }
    };

    // 清除任务的纯函数
    const clearTasks = () => {
        try {
            const clearedCount = queue.tasks.length
            queue.tasks = [];
            queue.processing = false;
            console.log(`已清除 ${clearedCount} 个任务`)
            return queue
        } catch (error) {
            console.error('清除任务时发生错误:', error.message)
            // 强制重置
            queue.tasks = []
            queue.processing = false
            return queue
        }
    };

    // 获取队列状态
    const getQueueStatus = () => {
        return {
            tasksCount: queue.tasks.length,
            processing: queue.processing,
            isEmpty: queue.tasks.length === 0
        }
    }

    return {
        addTask,
        processTasks,
        clearTasks,
        getQueueStatus
    }
}

