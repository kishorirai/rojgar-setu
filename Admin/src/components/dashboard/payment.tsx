import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/transactions`);
        let txns = [];
        if (Array.isArray(res.data)) {
          txns = res.data;
        } else if (Array.isArray(res.data.data)) {
          txns = res.data.data;
        }
        setTransactions(txns);
      } catch (err) {
        setTransactions([]);
      }
    };
    fetchTransactions();
  }, []);
  const highlightMatch = (text = '', searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.toString().split(regex).map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 dark:bg-yellow-600">
          {part}
        </span>
      ) : (
        part
      )
    );
  };
  const filteredTransactions = transactions.filter(txn =>
    (txn.payomatixId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (txn.customerEmail?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ).filter(txn =>
    statusFilter === "all" || txn.status === statusFilter
  );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>All payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by Transaction ID or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[1200px] lg:min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Txn ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-400">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map(txn => (
                      <TableRow key={txn._id}>
                        <TableCell className="font-medium">
                          {highlightMatch(txn.payomatixId, searchTerm)}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            txn.status === 'success' || txn.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : txn.status === 'failed' || txn.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {txn.status}
                          </span>
                        </TableCell>
                        <TableCell>{txn.amount} {txn.currency}</TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {highlightMatch(txn.customerName, searchTerm)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {highlightMatch(txn.customerEmail, searchTerm)}
                          </div>
                        </TableCell>
                        <TableCell>{txn.paymentMethod}</TableCell>
                        <TableCell>{formatDate(txn.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(txn)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">Transaction ID</h4>
                  <p className="text-sm">{selectedTransaction.payomatixId}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Correlation ID</h4>
                  <p className="text-sm">{selectedTransaction.correlationId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">Status</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedTransaction.status === 'success' || selectedTransaction.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedTransaction.status === 'failed' || selectedTransaction.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Amount</h4>
                  <p className="text-sm">{selectedTransaction.amount} {selectedTransaction.currency}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">Payment Method</h4>
                  <p className="text-sm">{selectedTransaction.paymentMethod}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Retry Count</h4>
                  <p className="text-sm">{selectedTransaction.retryCount}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <h5 className="text-xs text-gray-500">Name</h5>
                    <p className="text-sm">{selectedTransaction.customerName}</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-gray-500">Email</h5>
                    <p className="text-sm">{selectedTransaction.customerEmail}</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-gray-500">Phone</h5>
                    <p className="text-sm">{selectedTransaction.customerPhone}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">Message</h4>
                  <p className="text-sm">{selectedTransaction.message || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Failure Reason</h4>
                  <p className="text-sm">{selectedTransaction.failureReason || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">Received At</h4>
                  <p className="text-sm">{formatDate(selectedTransaction.receivedAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Processed At</h4>
                  <p className="text-sm">{formatDate(selectedTransaction.processedAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">Created At</h4>
                  <p className="text-sm">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Updated At</h4>
                  <p className="text-sm">{formatDate(selectedTransaction.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}