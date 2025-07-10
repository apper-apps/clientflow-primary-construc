const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const getAllInvoices = async () => {
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "amount" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "paymentDate" } },
        { field: { Name: "clientId" } },
        { field: { Name: "projectId" } }
      ],
      orderBy: [
        {
          fieldName: "dueDate",
          sorttype: "DESC"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords("app_invoice", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

export const getInvoiceById = async (id) => {
  try {
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "Tags" } },
        { field: { Name: "Owner" } },
        { field: { Name: "amount" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "paymentDate" } },
        { field: { Name: "clientId" } },
        { field: { Name: "projectId" } }
      ]
    };
    
    const response = await apperClient.getRecordById("app_invoice", parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice with ID ${id}:`, error);
    throw error;
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    // Validate required fields
    if (!invoiceData.projectId) {
      throw new Error("Project ID is required");
    }
    if (!invoiceData.amount || invoiceData.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    if (!invoiceData.dueDate) {
      throw new Error("Due date is required");
    }
    
    const params = {
      records: [{
        Name: `Invoice #${Date.now()}`,
        amount: parseFloat(invoiceData.amount),
        status: invoiceData.status || 'draft',
        dueDate: invoiceData.dueDate,
        paymentDate: invoiceData.paymentDate || null,
        clientId: parseInt(invoiceData.clientId),
        projectId: parseInt(invoiceData.projectId)
      }]
    };
    
    const response = await apperClient.createRecord("app_invoice", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        throw new Error(failedRecords[0].message || "Failed to create invoice");
      }
      
      return successfulRecords[0].data;
    }
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

export const updateInvoice = async (id, invoiceData) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error("Invalid invoice ID");
    }
    
    // Validate data if provided
    if (invoiceData.amount !== undefined && invoiceData.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    
    const params = {
      records: [{
        Id: parsedId,
        amount: invoiceData.amount !== undefined ? parseFloat(invoiceData.amount) : undefined,
        status: invoiceData.status,
        dueDate: invoiceData.dueDate,
        paymentDate: invoiceData.paymentDate,
        clientId: invoiceData.clientId ? parseInt(invoiceData.clientId) : undefined,
        projectId: invoiceData.projectId ? parseInt(invoiceData.projectId) : undefined
      }]
    };
    
    const response = await apperClient.updateRecord("app_invoice", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        throw new Error(failedUpdates[0].message || "Failed to update invoice");
      }
      
      return successfulUpdates[0].data;
    }
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

export const markInvoiceAsSent = async (id) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error("Invalid invoice ID");
    }
    
    const params = {
      records: [{
        Id: parsedId,
        status: 'sent'
      }]
    };
    
    const response = await apperClient.updateRecord("app_invoice", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        throw new Error(failedUpdates[0].message || "Failed to mark invoice as sent");
      }
      
      return successfulUpdates[0].data;
    }
  } catch (error) {
    console.error("Error marking invoice as sent:", error);
    throw error;
  }
};

export const markInvoiceAsPaid = async (id, paymentDate) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error("Invalid invoice ID");
    }
    
    if (!paymentDate) {
      throw new Error("Payment date is required");
    }
    
    const params = {
      records: [{
        Id: parsedId,
        status: 'paid',
        paymentDate: new Date(paymentDate).toISOString()
      }]
    };
    
    const response = await apperClient.updateRecord("app_invoice", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        throw new Error(failedUpdates[0].message || "Failed to mark invoice as paid");
      }
      
      return successfulUpdates[0].data;
    }
  } catch (error) {
    console.error("Error marking invoice as paid:", error);
    throw error;
  }
};

export const deleteInvoice = async (id) => {
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      throw new Error("Invalid invoice ID");
    }
    
    const params = {
      RecordIds: [parsedId]
    };
    
    const response = await apperClient.deleteRecord("app_invoice", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        throw new Error(failedDeletions[0].message || "Failed to delete invoice");
      }
      
      return true;
    }
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};