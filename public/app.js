// EDC Bills Manager - Main Application Logic

class BillsManager {
    constructor() {
        this.bills = this.loadBills();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderBills();
        this.updateStatistics();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('billForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBill();
        });

        // Filter by status
        document.getElementById('filterStatus').addEventListener('change', (e) => {
            this.renderBills(e.target.value);
        });

        // Clear all bills
        document.getElementById('clearAll').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all bills? This action cannot be undone.')) {
                this.clearAllBills();
            }
        });
    }

    addBill() {
        const form = document.getElementById('billForm');

        const bill = {
            id: Date.now().toString(),
            month: document.getElementById('billMonth').value,
            consumerNumber: document.getElementById('consumerNumber').value,
            unitsConsumed: parseFloat(document.getElementById('unitsConsumed').value),
            amount: parseFloat(document.getElementById('billAmount').value),
            dueDate: document.getElementById('dueDate').value,
            status: document.getElementById('status').value,
            createdAt: new Date().toISOString()
        };

        this.bills.push(bill);
        this.saveBills();
        this.renderBills();
        this.updateStatistics();

        form.reset();
        this.showNotification('Bill added successfully!', 'success');
    }

    deleteBill(id) {
        if (confirm('Are you sure you want to delete this bill?')) {
            this.bills = this.bills.filter(bill => bill.id !== id);
            this.saveBills();
            this.renderBills();
            this.updateStatistics();
            this.showNotification('Bill deleted successfully!', 'info');
        }
    }

    updateBillStatus(id, newStatus) {
        const bill = this.bills.find(b => b.id === id);
        if (bill) {
            bill.status = newStatus;
            this.saveBills();
            this.renderBills();
            this.updateStatistics();
            this.showNotification('Bill status updated!', 'success');
        }
    }

    renderBills(filterStatus = 'all') {
        const billsList = document.getElementById('billsList');

        let filteredBills = this.bills;
        if (filterStatus !== 'all') {
            filteredBills = this.bills.filter(bill => bill.status === filterStatus);
        }

        if (filteredBills.length === 0) {
            billsList.innerHTML = '<p class="empty-state">No bills found.</p>';
            return;
        }

        // Sort bills by date (newest first)
        filteredBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        billsList.innerHTML = filteredBills.map(bill => this.createBillCard(bill)).join('');

        // Add event listeners to action buttons
        filteredBills.forEach(bill => {
            const deleteBtn = document.getElementById(`delete-${bill.id}`);
            const statusSelect = document.getElementById(`status-${bill.id}`);

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteBill(bill.id));
            }

            if (statusSelect) {
                statusSelect.addEventListener('change', (e) => {
                    this.updateBillStatus(bill.id, e.target.value);
                });
            }
        });
    }

    createBillCard(bill) {
        const monthDate = new Date(bill.month + '-01');
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const dueDate = new Date(bill.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return `
            <div class="bill-card">
                <div class="bill-info">
                    <span class="bill-label">Billing Month</span>
                    <span class="bill-value">${monthName}</span>
                </div>
                <div class="bill-info">
                    <span class="bill-label">Consumer #</span>
                    <span class="bill-value">${bill.consumerNumber}</span>
                </div>
                <div class="bill-info">
                    <span class="bill-label">Units Consumed</span>
                    <span class="bill-value">${bill.unitsConsumed} kWh</span>
                </div>
                <div class="bill-info">
                    <span class="bill-label">Amount</span>
                    <span class="bill-value">$${bill.amount.toFixed(2)}</span>
                </div>
                <div class="bill-info">
                    <span class="bill-label">Due Date</span>
                    <span class="bill-value">${dueDate}</span>
                </div>
                <div class="bill-info">
                    <span class="bill-label">Status</span>
                    <select id="status-${bill.id}" class="status-badge status-${bill.status}">
                        <option value="paid" ${bill.status === 'paid' ? 'selected' : ''}>Paid</option>
                        <option value="unpaid" ${bill.status === 'unpaid' ? 'selected' : ''}>Unpaid</option>
                        <option value="overdue" ${bill.status === 'overdue' ? 'selected' : ''}>Overdue</option>
                    </select>
                </div>
                <div class="bill-actions">
                    <button id="delete-${bill.id}" class="btn btn-danger">Delete</button>
                </div>
            </div>
        `;
    }

    updateStatistics() {
        const totalBills = this.bills.length;
        const totalAmount = this.bills.reduce((sum, bill) => sum + bill.amount, 0);
        const unpaidBills = this.bills.filter(bill => bill.status === 'unpaid' || bill.status === 'overdue').length;
        const avgConsumption = totalBills > 0
            ? this.bills.reduce((sum, bill) => sum + bill.unitsConsumed, 0) / totalBills
            : 0;

        document.getElementById('totalBills').textContent = totalBills;
        document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
        document.getElementById('unpaidBills').textContent = unpaidBills;
        document.getElementById('avgConsumption').textContent = `${avgConsumption.toFixed(1)} kWh`;
    }

    clearAllBills() {
        this.bills = [];
        this.saveBills();
        this.renderBills();
        this.updateStatistics();
        this.showNotification('All bills cleared!', 'info');
    }

    loadBills() {
        const stored = localStorage.getItem('edcBills');
        return stored ? JSON.parse(stored) : [];
    }

    saveBills() {
        localStorage.setItem('edcBills', JSON.stringify(this.bills));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BillsManager();
});
