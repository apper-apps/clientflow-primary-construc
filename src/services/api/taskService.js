const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

// Mock time tracking storage for tasks that don't have database support
let timeTrackingData = new Map();
let nextTimeLogId = 100;

export const getAllTasks = async () => {
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "title" } },
        { field: { Name: "priority" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "projectId" } }
      ],
      orderBy: [
        {
          fieldName: "dueDate",
          sorttype: "ASC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords("task", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    // Add time tracking data to tasks
    const tasksWithTimeTracking = (response.data || []).map(task => ({
      ...task,
      timeTracking: timeTrackingData.get(task.Id) || {
        totalTime: 0,
        activeTimer: null,
        timeLogs: []
      }
    }));
    
    return tasksWithTimeTracking;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const getTaskById = async (id) => {
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "title" } },
        { field: { Name: "priority" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "projectId" } }
      ]
    };
    
    const response = await apperClient.getRecordById("task", parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    // Add time tracking data
    const taskWithTimeTracking = {
      ...response.data,
      timeTracking: timeTrackingData.get(response.data.Id) || {
        totalTime: 0,
        activeTimer: null,
        timeLogs: []
      }
    };
    
    return taskWithTimeTracking;
  } catch (error) {
    console.error(`Error fetching task with ID ${id}:`, error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const params = {
      records: [{
        Name: taskData.Name || taskData.title,
        title: taskData.title,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'todo',
        dueDate: taskData.dueDate,
        projectId: parseInt(taskData.projectId)
      }]
    };
    
    const response = await apperClient.createRecord("task", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        throw new Error(failedRecords[0].message || "Failed to create task");
      }
      
      const newTask = successfulRecords[0].data;
      // Initialize time tracking
      timeTrackingData.set(newTask.Id, {
        totalTime: 0,
        activeTimer: null,
        timeLogs: []
      });
      
      return {
        ...newTask,
        timeTracking: timeTrackingData.get(newTask.Id)
      };
    }
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const params = {
      records: [{
        Id: parseInt(id),
        Name: taskData.Name || taskData.title,
        title: taskData.title,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate,
        projectId: parseInt(taskData.projectId)
      }]
    };
    
    const response = await apperClient.updateRecord("task", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        throw new Error(failedUpdates[0].message || "Failed to update task");
      }
      
      const updatedTask = successfulUpdates[0].data;
      return {
        ...updatedTask,
        timeTracking: timeTrackingData.get(updatedTask.Id) || {
          totalTime: 0,
          activeTimer: null,
          timeLogs: []
        }
      };
    }
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const updateTaskStatus = async (id, status) => {
  try {
    const params = {
      records: [{
        Id: parseInt(id),
        status: status
      }]
    };
    
    const response = await apperClient.updateRecord("task", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        throw new Error(failedUpdates[0].message || "Failed to update task status");
      }
      
      const updatedTask = successfulUpdates[0].data;
      return {
        ...updatedTask,
        timeTracking: timeTrackingData.get(updatedTask.Id) || {
          totalTime: 0,
          activeTimer: null,
          timeLogs: []
        }
      };
    }
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord("task", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        throw new Error(failedDeletions[0].message || "Failed to delete task");
      }
      
      // Clean up time tracking data
      timeTrackingData.delete(parseInt(id));
      
      return true;
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Time tracking functions (using local storage since not in database)
export const startTaskTimer = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const taskId = parseInt(id);
  const now = new Date().toISOString();
  
  let timeTracking = timeTrackingData.get(taskId) || {
    totalTime: 0,
    activeTimer: null,
    timeLogs: []
  };

  if (timeTracking.activeTimer) {
    throw new Error("Timer already running for this task");
  }

  timeTracking.activeTimer = {
    Id: taskId,
    startTime: now
  };
  
  timeTrackingData.set(taskId, timeTracking);
  
  return { ...timeTracking.activeTimer };
};

export const stopTaskTimer = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const taskId = parseInt(id);
  let timeTracking = timeTrackingData.get(taskId);
  
  if (!timeTracking?.activeTimer) {
    throw new Error("No active timer for this task");
  }

  const now = new Date().toISOString();
  const startTime = new Date(timeTracking.activeTimer.startTime);
  const endTime = new Date(now);
  const duration = endTime.getTime() - startTime.getTime();

  const timeLog = {
    Id: nextTimeLogId++,
    startTime: timeTracking.activeTimer.startTime,
    endTime: now,
    duration: duration,
    date: startTime.toISOString().split('T')[0]
  };

  timeTracking.timeLogs.push(timeLog);
  timeTracking.totalTime += duration;
  timeTracking.activeTimer = null;
  
  timeTrackingData.set(taskId, timeTracking);

  return { ...timeLog };
};

export const getTaskTimeLogs = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const taskId = parseInt(id);
  const timeTracking = timeTrackingData.get(taskId);
  
  return timeTracking?.timeLogs || [];
};