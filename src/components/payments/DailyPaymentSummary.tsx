
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock } from 'lucide-react';
import { ShopPaymentSummary } from '@/hooks/useShopPayments';
import { formatCurrency } from '@/utils/reportUtils';

interface DailyPaymentSummaryProps {
  summaries: ShopPaymentSummary[];
  shopName?: string;
}

const DailyPaymentSummary: React.FC<DailyPaymentSummaryProps> = ({
  summaries,
  shopName
}) => {
  // Group summaries by date
  const groupedSummaries = summaries.reduce((acc, summary) => {
    const date = summary.payment_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(summary);
    return acc;
  }, {} as Record<string, ShopPaymentSummary[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Calendar className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          {shopName ? `Daily Payment Summary - ${shopName}` : 'Daily Payment Summary'}
        </h3>
      </div>

      {Object.entries(groupedSummaries).map(([date, dateSummaries]) => {
        const totalPending = dateSummaries.reduce((sum, s) => sum + Number(s.pending_amount), 0);
        const totalPaid = dateSummaries.reduce((sum, s) => sum + Number(s.paid_amount), 0);
        const totalTransactions = dateSummaries.reduce((sum, s) => sum + Number(s.total_transactions), 0);

        return (
          <Card key={date}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardTitle>
                  <CardDescription>
                    {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {totalPending > 0 && (
                    <Badge variant="destructive" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Pending</span>
                    </Badge>
                  )}
                  {totalPaid > 0 && (
                    <Badge variant="default" className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Paid</span>
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(totalPending)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Paid Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(totalPending + totalPaid)}
                  </p>
                </div>
              </div>

              {!shopName && dateSummaries.length > 1 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Shop Breakdown:</h4>
                  {dateSummaries.map((summary) => (
                    <div key={summary.shop_name} className="flex justify-between items-center text-sm">
                      <span>{summary.shop_name}</span>
                      <div className="flex space-x-4">
                        <span className="text-red-600">
                          Pending: {formatCurrency(Number(summary.pending_amount))}
                        </span>
                        <span className="text-green-600">
                          Paid: {formatCurrency(Number(summary.paid_amount))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {Object.keys(groupedSummaries).length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No payment data available
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyPaymentSummary;
