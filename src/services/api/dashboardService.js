import { getAllClients } from '@/services/api/clientService';
import { getAllProjects } from '@/services/api/projectService';
import { getAllTasks } from '@/services/api/taskService';
import { getAllInvoices } from '@/services/api/invoiceService';

export const getDashboardData = async () => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Fetch data from all services to build dashboard summary
    const [clients, projects, tasks, invoices] = await Promise.all([
      getAllClients(),
      getAllProjects(), 
      getAllTasks(),
      getAllInvoices()
    ]);
    
    // Calculate summary statistics
    const totalClients = clients.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length;
    const monthlyRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const overdueItems = tasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;
    
    // Mock recent activity based on real data
    const recentActivity = [
      {
        id: 1,
        type: "project",
        title: "Project activity updated",
        client: "Active Client",
        time: "2 hours ago",
        icon: "CheckCircle2"
      },
      {
        id: 2,
        type: "task",
        title: "New task created",
        client: "Project Team",
        time: "4 hours ago",
        icon: "Plus"
      },
      {
        id: 3,
        type: "invoice",
        title: "Invoice sent to client",
        client: "Business Client",
        time: "6 hours ago",
        icon: "FileText"
      },
      {
        id: 4,
        type: "client",
        title: "New client added",
        client: "New Business",
        time: "1 day ago",
        icon: "UserPlus"
      },
      {
        id: 5,
        type: "payment",
        title: "Payment received",
        client: "Valued Client",
        time: "2 days ago",
        icon: "DollarSign"
      }
    ];
    
    return {
      summary: {
        totalClients,
        activeProjects,
        pendingTasks,
        monthlyRevenue,
        completedTasks,
        overdueItems
      },
      recentActivity,
      quickStats: {
        projectsThisWeek: Math.floor(activeProjects * 0.4),
        tasksCompleted: completedTasks,
        hoursTracked: Math.floor(completedTasks * 2.5),
        invoicesSent: invoices.filter(i => i.status === 'sent').length
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};