
import React from 'react';
import { useData } from '../context/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SummaryCards from '../components/reports/SummaryCards';
import MonthlySalesTable from '../components/reports/MonthlySalesTable';
import CustomerAnalytics from '../components/reports/CustomerAnalytics';
import PaymentMethods from '../components/reports/PaymentMethods';
import TransactionReport from '../components/reports/TransactionReport';
import CustomerReport from '../components/reports/CustomerReport';
import ExpenseReport from '../components/reports/ExpenseReport';

const Reports: React.FC = () => {
  const { transactions, customers, expenses } = useData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4 pt-4">
          <SummaryCards transactions={transactions} customers={customers} />
          <MonthlySalesTable transactions={transactions} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <CustomerAnalytics customers={customers} />
            <PaymentMethods transactions={transactions} />
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="pt-4">
          <TransactionReport transactions={transactions} />
        </TabsContent>
        
        <TabsContent value="customers" className="pt-4">
          <CustomerReport customers={customers} />
        </TabsContent>
        
        <TabsContent value="expenses" className="pt-4">
          <ExpenseReport expenses={expenses} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
