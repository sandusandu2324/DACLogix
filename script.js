document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});




function initializeApp() {
    setupNavigation();
    
    setupContactForm();
    
    setupInvoiceForm();
    
    setupModal();
    
    setDefaultDates();
    
    generateInvoiceNumber();
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            switchPage(targetPage);
            
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function switchPage(pageType) {
    const pages = document.querySelectorAll('.page');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    pages.forEach(page => page.classList.remove('active'));
    
    const targetPage = document.getElementById(pageType + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-page') === pageType) {
            btn.classList.add('active');
        }
    });
}

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        alert('Thank you for your message! We\'ll get back to you within 24 hours.');
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function setupInvoiceForm() {
    const addLineItemBtn = document.getElementById('addLineItem');
    if (addLineItemBtn) {
        addLineItemBtn.addEventListener('click', addLineItem);
    }
    
    const taxRateInput = document.getElementById('taxRate');
    if (taxRateInput) {
        taxRateInput.addEventListener('input', calculateTotals);
    }
    
    const previewBtn = document.getElementById('previewInvoice');
    const downloadBtn = document.getElementById('downloadInvoice');
    
    if (previewBtn) {
        previewBtn.addEventListener('click', previewInvoice);
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadInvoice);
    }
    
    calculateTotals();
    
    addLineItemListeners();
}

function addLineItemListeners() {
    const lineItems = document.querySelectorAll('.line-item');
    
    lineItems.forEach(item => {
        const quantityInput = item.querySelector('input[name="quantity"]');
        const rateInput = item.querySelector('input[name="rate"]');
        
        if (quantityInput) {
            quantityInput.addEventListener('input', function() {
                updateLineItemAmount(this.closest('.line-item'));
                calculateTotals();
            });
        }
        
        if (rateInput) {
            rateInput.addEventListener('input', function() {
                updateLineItemAmount(this.closest('.line-item'));
                calculateTotals();
            });
        }
    });
}

function addLineItem() {
    const lineItemsContainer = document.getElementById('lineItems');
    const newLineItem = document.createElement('div');
    newLineItem.className = 'line-item';
    
    newLineItem.innerHTML = `
        <div class="form-row">
            <div class="form-group flex-2">
                <label>Description</label>
                <input type="text" name="description" placeholder="Transportation service description" required>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" name="quantity" value="1" min="1" required>
            </div>
            <div class="form-group">
                <label>Rate ($)</label>
                <input type="number" name="rate" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="text" name="amount" readonly>
            </div>
            <button type="button" class="remove-item" onclick="removeLineItem(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    lineItemsContainer.appendChild(newLineItem);
    
    const quantityInput = newLineItem.querySelector('input[name="quantity"]');
    const rateInput = newLineItem.querySelector('input[name="rate"]');
    
    quantityInput.addEventListener('input', function() {
        updateLineItemAmount(this.closest('.line-item'));
        calculateTotals();
    });
    
    rateInput.addEventListener('input', function() {
        updateLineItemAmount(this.closest('.line-item'));
        calculateTotals();
    });
}

function removeLineItem(button) {
    const lineItem = button.closest('.line-item');
    const lineItemsContainer = document.getElementById('lineItems');
    
    if (lineItemsContainer.children.length > 1) {
        lineItem.remove();
        calculateTotals();
    } else {
        alert('At least one service item is required.');
    }
}

function updateLineItemAmount(lineItem) {
    const quantityInput = lineItem.querySelector('input[name="quantity"]');
    const rateInput = lineItem.querySelector('input[name="rate"]');
    const amountInput = lineItem.querySelector('input[name="amount"]');
    
    const quantity = parseFloat(quantityInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const amount = quantity * rate;
    
    amountInput.value = formatCurrency(amount);
}

function calculateTotals() {
    const lineItems = document.querySelectorAll('.line-item');
    let subtotal = 0;
    
    lineItems.forEach(item => {
        const quantityInput = item.querySelector('input[name="quantity"]');
        const rateInput = item.querySelector('input[name="rate"]');
        
        const quantity = parseFloat(quantityInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        subtotal += quantity * rate;
        
        updateLineItemAmount(item);
    });
    
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function setDefaultDates() {
    const today = new Date();
    const invoiceDateInput = document.getElementById('invoiceDate');
    const dueDateInput = document.getElementById('dueDate');
    
    if (invoiceDateInput) {
        invoiceDateInput.value = today.toISOString().split('T')[0];
    }
    
    if (dueDateInput) {
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 30); // 30 days from today
        dueDateInput.value = dueDate.toISOString().split('T')[0];
    }
}

function generateInvoiceNumber() {
    const invoiceNumberInput = document.getElementById('invoiceNumber');
    if (invoiceNumberInput && !invoiceNumberInput.value) {
        const prefix = 'INV-';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        invoiceNumberInput.value = prefix + timestamp + random;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
    
    const toolsToggle = document.querySelector('.tools-toggle');
    const toolsDropdown = document.querySelector('.tools-dropdown');
});

function setupModal() {
    const modal = document.getElementById('invoiceModal');
    const closeBtn = modal.querySelector('.close');
    const printBtn = document.getElementById('printInvoice');
    const downloadPDFBtn = document.getElementById('downloadPDF');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (printBtn) {
        printBtn.addEventListener('click', printInvoice);
    }
    
    if (downloadPDFBtn) {
        downloadPDFBtn.addEventListener('click', downloadInvoice);
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function openModal() {
    const modal = document.getElementById('invoiceModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('invoiceModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function previewInvoice() {
    if (!validateInvoiceForm()) {
        return;
    }
    
    const invoiceData = collectInvoiceData();
    const previewHTML = generateInvoiceHTML(invoiceData);
    
    document.getElementById('invoicePreview').innerHTML = previewHTML;
    openModal();
}

function validateInvoiceForm() {
    const requiredFields = [
        'companyName', 'companyAddress', 'companyCity', 'companyState', 'companyZip',
        'clientName', 'clientAddress', 'clientCity', 'clientState', 'clientZip',
        'invoiceNumber', 'invoiceDate', 'dueDate'
    ];
    
    for (let fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            alert(`Please fill in the ${fieldId.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
            field?.focus();
            return false;
        }
    }
    
    const lineItems = document.querySelectorAll('.line-item');
    for (let item of lineItems) {
        const description = item.querySelector('input[name="description"]').value.trim();
        const quantity = item.querySelector('input[name="quantity"]').value;
        const rate = item.querySelector('input[name="rate"]').value;
        
        if (!description || !quantity || !rate) {
            alert('Please fill in all service details.');
            return false;
        }
    }
    
    return true;
}

function collectInvoiceData() {
    const formData = {};
    
    formData.company = {
        name: document.getElementById('companyName').value,
        address: document.getElementById('companyAddress').value,
        city: document.getElementById('companyCity').value,
        state: document.getElementById('companyState').value,
        zip: document.getElementById('companyZip').value
    };
    
    formData.client = {
        name: document.getElementById('clientName').value,
        address: document.getElementById('clientAddress').value,
        city: document.getElementById('clientCity').value,
        state: document.getElementById('clientState').value,
        zip: document.getElementById('clientZip').value
    };
    
    formData.invoice = {
        number: document.getElementById('invoiceNumber').value,
        date: formatDate(document.getElementById('invoiceDate').value),
        dueDate: formatDate(document.getElementById('dueDate').value)
    };
    
    formData.items = [];
    const lineItems = document.querySelectorAll('.line-item');
    
    lineItems.forEach(item => {
        const description = item.querySelector('input[name="description"]').value;
        const quantity = parseFloat(item.querySelector('input[name="quantity"]').value);
        const rate = parseFloat(item.querySelector('input[name="rate"]').value);
        const amount = quantity * rate;
        
        formData.items.push({
            description,
            quantity,
            rate,
            amount
        });
    });
    
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    formData.totals = {
        subtotal,
        taxRate,
        taxAmount,
        total
    };
    
    return formData;
}

function generateInvoiceHTML(data) {
    return `
        <h1>INVOICE</h1>
        
        <div class="invoice-details-grid">
            <div class="company-info">
                <h3>From:</h3>
                <p><strong>${data.company.name}</strong></p>
                <p>${data.company.address}</p>
                <p>${data.company.city}, ${data.company.state} ${data.company.zip}</p>
            </div>
            
            <div class="client-info">
                <h3>Bill To:</h3>
                <p><strong>${data.client.name}</strong></p>
                <p>${data.client.address}</p>
                <p>${data.client.city}, ${data.client.state} ${data.client.zip}</p>
            </div>
        </div>
        
        <div class="invoice-meta">
            <div class="meta-item">
                <strong>Invoice #</strong>
                <span>${data.invoice.number}</span>
            </div>
            <div class="meta-item">
                <strong>Invoice Date</strong>
                <span>${data.invoice.date}</span>
            </div>
            <div class="meta-item">
                <strong>Due Date</strong>
                <span>${data.invoice.dueDate}</span>
            </div>
        </div>
        
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th class="amount-cell">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.rate)}</td>
                        <td class="amount-cell">${formatCurrency(item.amount)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="invoice-totals">
            <div class="total-line">
                <span>Subtotal:</span>
                <span>${formatCurrency(data.totals.subtotal)}</span>
            </div>
            ${data.totals.taxRate > 0 ? `
                <div class="total-line">
                    <span>Tax (${data.totals.taxRate}%):</span>
                    <span>${formatCurrency(data.totals.taxAmount)}</span>
                </div>
            ` : ''}
            <div class="total-line final-total">
                <span>Total:</span>
                <span>${formatCurrency(data.totals.total)}</span>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function printInvoice() {
    window.print();
}

function downloadInvoice() {
    if (!validateInvoiceForm()) {
        return;
    }
    
    const invoiceData = collectInvoiceData();
    const invoiceHTML = generateInvoiceHTML(invoiceData);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice ${invoiceData.invoice.number}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                    line-height: 1.6;
                }
                h1 {
                    color: #2563eb;
                    font-size: 2.5rem;
                    margin-bottom: 2rem;
                    text-align: center;
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 1rem;
                }
                .invoice-details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                    margin-bottom: 3rem;
                }
                .company-info, .client-info {
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: 12px;
                    border-left: 4px solid #2563eb;
                }
                .company-info h3, .client-info h3 {
                    color: #2563eb;
                    margin-bottom: 1rem;
                    font-size: 1.2rem;
                }
                .invoice-meta {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin-bottom: 3rem;
                    text-align: center;
                }
                .meta-item {
                    background: #f8fafc;
                    padding: 1rem;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }
                .meta-item strong {
                    color: #2563eb;
                    display: block;
                    margin-bottom: 0.5rem;
                }
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 2rem;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .invoice-table th {
                    background: #2563eb;
                    color: white;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                }
                .invoice-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #e2e8f0;
                }
                .invoice-table tr:last-child td {
                    border-bottom: none;
                }
                .invoice-table tr:nth-child(even) {
                    background: #f8fafc;
                }
                .amount-cell {
                    text-align: right;
                    font-weight: 600;
                }
                .invoice-totals {
                    max-width: 400px;
                    margin-left: auto;
                    background: #f8fafc;
                    padding: 2rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }
                .total-line {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    font-size: 1.1rem;
                }
                .final-total {
                    border-top: 2px solid #2563eb;
                    padding-top: 1rem;
                    font-weight: 700;
                    font-size: 1.3rem;
                    color: #2563eb;
                }
                @media print {
                    body { margin: 0; padding: 15px; }
                    .invoice-details-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
                    .invoice-meta { grid-template-columns: repeat(3, 1fr); }
                }
            </style>
        </head>
        <body>
            <div class="invoice-preview-content">
                ${invoiceHTML}
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 500);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    document.querySelectorAll('.contact-card, .floating-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(observeElements, 100);
});