import { Transaction, Customer, Expense } from '../types';

// Format currency helper function
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate monthly sales data
export const calculateMonthlySales = (transactions: Transaction[]) => {
  const salesByMonth: Record<string, { total: number; count: number; paid: number; pending: number }> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const key = `${month} ${year}`;
    
    if (!salesByMonth[key]) {
      salesByMonth[key] = {
        total: 0,
        count: 0,
        paid: 0,
        pending: 0
      };
    }
    
    salesByMonth[key].total += transaction.amount;
    salesByMonth[key].count += 1;
    
    if (transaction.paymentStatus === 'paid') {
      salesByMonth[key].paid += transaction.amount;
    } else {
      salesByMonth[key].pending += transaction.amount;
    }
  });
  
  return Object.entries(salesByMonth).map(([month, data]) => ({
    month,
    total: data.total,
    count: data.count,
    paid: data.paid,
    pending: data.pending
  })).sort((a, b) => {
    const [aMonth, aYear] = a.month.split(' ');
    const [bMonth, bYear] = b.month.split(' ');
    return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
  });
};

// Calculate customer metrics
export const calculateCustomerMetrics = (customers: Customer[]) => {
  const newCustomers = customers.filter(c => c.isNew).length;
  const returningCustomers = customers.length - newCustomers;
  
  return {
    total: customers.length,
    new: newCustomers,
    returning: returningCustomers,
    newPercentage: customers.length > 0 ? Math.round((newCustomers / customers.length) * 100) : 0
  };
};

// Calculate payment method distribution
export const calculatePaymentMethodDistribution = (transactions: Transaction[]) => {
  const methods = {
    cash: 0,
    upi: 0,
    other: 0
  };
  
  transactions.forEach(t => {
    if (t.paymentMethod === 'cash') {
      methods.cash += t.amount;
    } else if (t.paymentMethod === 'upi') {
      methods.upi += t.amount;
    } else {
      methods.other += t.amount;
    }
  });
  
  return methods;
};

// Format date for export filename
export const formatDateForFilename = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Generate CSV data for export
export const generateCsvData = (data: any[], type: string) => {
  let csvContent = '';
  
  if (type === 'transactions') {
    csvContent = 'Date,Shop Name,Customer ID,Amount,Payment Status,Payment Method,Commission,Commission Status\n';
    data.forEach(t => {
      csvContent += `${new Date(t.date).toLocaleDateString()},${t.shopName},${t.customerId},${t.amount},${t.paymentStatus},${t.paymentMethod},${t.commission || 0},${t.commissionStatus || 'N/A'}\n`;
    });
  } else if (type === 'customers') {
    csvContent = 'Name,Phone,Email,Address,Status,Created At\n';
    data.forEach(c => {
      csvContent += `${c.name},${c.phone},${c.email || 'N/A'},${c.address || 'N/A'},${c.isNew ? 'New' : 'Returning'},${new Date(c.createdAt).toLocaleDateString()}\n`;
    });
  } else if (type === 'expenses') {
    csvContent = 'Date,Title,Amount,Category,Description,Added By\n';
    data.forEach(e => {
      csvContent += `${new Date(e.date).toLocaleDateString()},${e.title},${e.amount},${e.category},${e.description || 'N/A'},${e.addedBy}\n`;
    });
  }
  
  return csvContent;
};

// Handle export data to CSV
export const exportToCsv = (data: string, filename: string) => {
  const blob = new Blob([data as BlobPart], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
