const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// SQLite Database Setup
const dbPath = path.resolve(__dirname, 'crm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
    // Enable Foreign Keys
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('Failed to enable foreign keys:', pragmaErr);
      } else {
        console.log('Foreign key constraints enabled.');
      }
    });
  }
});

// Database Schema Initialization in Serialized Mode
db.serialize(() => {
  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS Customer (
    CID VARCHAR(6) PRIMARY KEY,
    Name VARCHAR(50),
    Email VARCHAR(100),
    Phone VARCHAR(10),
    Address VARCHAR(50),
    Gender VARCHAR(20),
    RegDt DATE,
    CustomerType VARCHAR(20)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Employee (
    EID VARCHAR(6) PRIMARY KEY,
    Name VARCHAR(50),
    Email VARCHAR(100),
    Phone VARCHAR(10),
    Address VARCHAR(50),
    Designation VARCHAR(20),
    Salary DECIMAL(7,2)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Product (
    PID VARCHAR(6) PRIMARY KEY,
    PName VARCHAR(50),
    Category VARCHAR(50),
    Price DECIMAL(10,2),
    Stock INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Orders (
    OID VARCHAR(6) PRIMARY KEY,
    ODt DATE,
    TotalAmt DECIMAL(10,2),
    Status VARCHAR(10),
    CID VARCHAR(6) REFERENCES Customer(CID) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS OrderDetails (
    ODID VARCHAR(6) PRIMARY KEY,
    OID VARCHAR(6) REFERENCES Orders(OID) ON DELETE CASCADE,
    PID VARCHAR(6) REFERENCES Product(PID) ON DELETE CASCADE,
    Qty INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Payment (
    PayID VARCHAR(6) PRIMARY KEY,
    PayDt DATE,
    Amt DECIMAL(10,2),
    PayMethod VARCHAR(10),
    OID VARCHAR(6) REFERENCES Orders(OID) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Feedback (
    FID VARCHAR(6) PRIMARY KEY,
    Rating DECIMAL(2,1),
    Comments VARCHAR(50),
    FbDt DATE,
    CID VARCHAR(6) REFERENCES Customer(CID) ON DELETE CASCADE,
    OID VARCHAR(6) REFERENCES Orders(OID) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS SupportTicket (
    TicketID VARCHAR(6) PRIMARY KEY,
    CID VARCHAR(6) REFERENCES Customer(CID) ON DELETE CASCADE,
    EID VARCHAR(6) REFERENCES Employee(EID) ON DELETE CASCADE,
    Status VARCHAR(10),
    IssueType VARCHAR(20),
    Description VARCHAR(50),
    CreatedDt DATE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Customer_Audit (
    CID VARCHAR(6),
    Name VARCHAR(50),
    Deleted_Date DATE
  )`);

  // Create Trigger
  db.run(`CREATE TRIGGER IF NOT EXISTS log_customer_deletion
    AFTER DELETE ON Customer
    BEGIN
      INSERT INTO Customer_Audit (CID, Name, Deleted_Date)
      VALUES (OLD.CID, OLD.Name, DATE('now'));
    END;
  `);

  console.log('Database tables and triggers verified.');

  // Seed Data: Check if seed data exists by verifying if Customer table is empty
  db.get('SELECT COUNT(*) AS count FROM Customer', (err, row) => {
    if (err) {
      console.error('Error checking Customer table row count:', err);
      return;
    }
    if (row.count === 0) {
      console.log('Database is empty. Seeding data...');
      db.exec(`
        BEGIN TRANSACTION;
        -- Seed Customers
        INSERT INTO Customer (CID, Name, Email, Phone, Address, Gender, RegDt, CustomerType) VALUES
        ('C001', 'Rahul Sharma', 'rahul.sharma@email.com', '9876543210', 'Kolkata', 'Male', '2025-01-15', 'Regular'),
        ('C002', 'Priya Das', 'priya.das@email.com', '9876543211', 'Durgapur', 'Female', '2025-01-20', 'VIP'),
        ('C003', 'Amit Roy', 'amit.roy@email.com', '9876543212', 'Siliguri', 'Male', '2025-02-05', 'Regular'),
        ('C004', 'Sneha Sen', 'sneha.sen@email.com', '9876543213', 'Asansol', 'Female', '2025-02-10', 'VIP'),
        ('C005', 'Arjun Gupta', 'arjun.gupta@email.com', '9876543214', 'Howrah', 'Male', '2025-02-15', 'Regular'),
        ('C006', 'Neha Verma', 'neha.verma@email.com', '9876543215', 'Kharagpur', 'Female', '2025-02-20', 'VIP'),
        ('C007', 'Vikram Singh', 'vikram.singh@email.com', '9876543216', 'Kolkata', 'Male', '2025-02-25', 'Regular');

        -- Seed Employees
        INSERT INTO Employee (EID, Name, Email, Phone, Address, Designation, Salary) VALUES
        ('E001', 'Ananya Bose', 'ananya.bose@retailcrm.com', '9876543220', 'Kolkata', 'Manager', 85000.00),
        ('E002', 'Souvik Dey', 'souvik.dey@retailcrm.com', '9876543221', 'Durgapur', 'Support Executive', 45000.00),
        ('E003', 'Rakesh Kumar', 'rakesh.kumar@retailcrm.com', '9876543222', 'Siliguri', 'Sales Executive', 50000.00),
        ('E004', 'Pooja Singh', 'pooja.singh@retailcrm.com', '9876543223', 'Asansol', 'Support Executive', 42000.00),
        ('E005', 'Akash Roy', 'akash.roy@retailcrm.com', '9876543224', 'Howrah', 'Sales Executive', 48000.00),
        ('E006', 'Ritu Sharma', 'ritu.sharma@retailcrm.com', '9876543225', 'Kharagpur', 'Support Executive', 43000.00),
        ('E007', 'Manish Gupta', 'manish.gupta@retailcrm.com', '9876543226', 'Kolkata', 'Manager', 80000.00);

        -- Seed Products
        INSERT INTO Product (PID, PName, Category, Price, Stock) VALUES
        ('P001', 'Laptop', 'Electronics', 55000.00, 20),
        ('P002', 'Smartphone', 'Electronics', 25000.00, 50),
        ('P003', 'Headphones', 'Electronics', 3000.00, 100),
        ('P004', 'Printer', 'Electronics', 12000.00, 15),
        ('P005', 'Keyboard', 'Accessories', 1500.00, 60),
        ('P006', 'Mouse', 'Accessories', 800.00, 80),
        ('P007', 'Webcam', 'Accessories', 2500.00, 40);

        -- Seed Orders
        INSERT INTO Orders (OID, ODt, TotalAmt, Status, CID) VALUES
        ('O001', '2025-01-20', 55000.00, 'Completed', 'C001'),
        ('O002', '2025-02-10', 3000.00, 'Completed', 'C001'),
        ('O003', '2025-03-05', 1500.00, 'Completed', 'C001'),
        ('O004', '2025-01-28', 25000.00, 'Completed', 'C002'),
        ('O005', '2025-02-25', 12000.00, 'Completed', 'C003'),
        ('O006', '2025-03-15', 800.00, 'Completed', 'C004'),
        ('O007', '2025-04-05', 2500.00, 'Completed', 'C005');

        -- Seed OrderDetails
        INSERT INTO OrderDetails (ODID, OID, PID, Qty) VALUES
        ('OD001', 'O001', 'P001', 1),
        ('OD002', 'O002', 'P003', 1),
        ('OD003', 'O003', 'P005', 1),
        ('OD004', 'O004', 'P002', 1),
        ('OD005', 'O005', 'P004', 1),
        ('OD006', 'O006', 'P006', 1),
        ('OD007', 'O007', 'P007', 1);

        -- Seed Payments
        INSERT INTO Payment (PayID, PayDt, Amt, PayMethod, OID) VALUES
        ('PM001', '2025-01-20', 55000.00, 'UPI', 'O001'),
        ('PM002', '2025-02-10', 3000.00, 'Card', 'O002'),
        ('PM003', '2025-03-05', 1500.00, 'Cash', 'O003'),
        ('PM004', '2025-01-28', 25000.00, 'UPI', 'O004'),
        ('PM005', '2025-02-25', 12000.00, 'Card', 'O005'),
        ('PM006', '2025-03-15', 800.00, 'Cash', 'O006'),
        ('PM007', '2025-04-05', 2500.00, 'UPI', 'O007');

        -- Seed Support Tickets
        INSERT INTO SupportTicket (TicketID, CID, EID, Status, IssueType, Description, CreatedDt) VALUES
        ('T001', 'C001', 'E002', 'Resolved', 'Delivery', 'Delayed package delivery', '2025-01-22'),
        ('T002', 'C002', 'E002', 'Open', 'Payment', 'UPI payment failed but debited', '2025-01-29'),
        ('T003', 'C003', 'E002', 'Closed', 'Warranty', 'Printer warranty claim activation', '2025-03-01'),
        ('T004', 'C004', 'E003', 'Resolved', 'Refund', 'Double charge refund request', '2025-03-16'),
        ('T005', 'C005', 'E002', 'Open', 'Technical', 'Webcam driver installation issue', '2025-04-06'),
        ('T006', 'C006', 'E003', 'Resolved', 'Replacement', 'Defective keyboard key replacement', '2025-02-22'),
        ('T007', 'C007', 'E002', 'Closed', 'Account', 'Password reset link not working', '2025-02-26');

        -- Seed Feedback
        INSERT INTO Feedback (FID, Rating, Comments, FbDt, CID, OID) VALUES
        ('F001', 5.0, 'Excellent service and product', '2025-01-21', 'C001', 'O001'),
        ('F002', 4.0, 'Good headphones, fast delivery', '2025-02-12', 'C001', 'O002'),
        ('F003', 3.5, 'Keyboard is decent, keys are soft', '2025-03-07', 'C001', 'O003'),
        ('F004', 5.0, 'Awesome screen and speed', '2025-01-30', 'C002', 'O004'),
        ('F005', 4.5, 'Printer works great, easy setup', '2025-03-02', 'C003', 'O005'),
        ('F006', 3.0, 'Average mouse, scroll wheel is stiff', '2025-03-17', 'C004', 'O006'),
        ('F007', 4.0, 'Webcam quality is clear for calls', '2025-04-08', 'C005', 'O007');
        COMMIT;
      `, (execErr) => {
        if (execErr) {
          console.error('Error seeding data via db.exec:', execErr);
        } else {
          console.log('Seed data successfully loaded.');
        }
      });
    } else {
      console.log('Database already contains data. Seeding skipped.');
    }
  });
});

// Help functions to run queries as Promises
function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Helper to generate new IDs
async function generateId(table, prefix, colName) {
  const row = await dbGet(`SELECT ${colName} FROM ${table} WHERE ${colName} LIKE '${prefix}%' ORDER BY ${colName} DESC LIMIT 1`);
  if (!row) {
    return `${prefix}001`;
  }
  const numericPart = parseInt(row[colName].substring(prefix.length), 10);
  const nextNum = numericPart + 1;
  const padLen = Math.max(3, row[colName].length - prefix.length);
  return prefix + String(nextNum).padStart(padLen, '0');
}

// Helper to fetch request credentials
function getAuthUser(req) {
  return {
    role: req.headers['x-user-role'] || 'Employee',
    eid: req.headers['x-user-eid'] || null
  };
}

// Middleware to enforce Admin-only route access
const requireAdmin = (req, res, next) => {
  const { role } = getAuthUser(req);
  if (role !== 'Admin') {
    return res.status(403).json({ error: 'Access Denied: Admin role required' });
  }
  next();
};

// API ENDPOINTS

// 1. Dashboard Overview Stats & Widgets
app.get('/api/dashboard', async (req, res) => {
  try {
    const { role, eid } = getAuthUser(req);

    if (role === 'Employee') {
      if (!eid) {
        return res.status(400).json({ error: 'Missing Employee ID' });
      }

      // Operational statistics for employee
      const customerCount = await dbGet('SELECT COUNT(*) AS count FROM Customer');
      const orderCount = await dbGet('SELECT COUNT(*) AS count FROM Orders');
      
      // Support statistics assigned to this employee
      const assignedTickets = await dbGet('SELECT COUNT(*) AS count FROM SupportTicket WHERE EID = ?', [eid]);
      const openTicketsCount = await dbGet("SELECT COUNT(*) AS count FROM SupportTicket WHERE EID = ? AND Status IN ('Open', 'In Progress')", [eid]);
      const resolvedTicketsCount = await dbGet("SELECT COUNT(*) AS count FROM SupportTicket WHERE EID = ? AND Status IN ('Resolved', 'Closed')", [eid]);

      // Data Tables
      const latestCustomers = await dbAll(`
        SELECT * FROM Customer 
        ORDER BY RegDt DESC, CID DESC 
        LIMIT 5
      `);

      const recentOrders = await dbAll(`
        SELECT O.*, C.Name as CustomerName 
        FROM Orders O 
        JOIN Customer C ON O.CID = C.CID 
        ORDER BY O.ODt DESC, O.OID DESC 
        LIMIT 5
      `);

      const myTickets = await dbAll(`
        SELECT T.*, C.Name as CustomerName 
        FROM SupportTicket T
        JOIN Customer C ON T.CID = C.CID
        WHERE T.EID = ?
        ORDER BY T.CreatedDt DESC, T.TicketID DESC
        LIMIT 5
      `, [eid]);

      return res.json({
        role: 'Employee',
        stats: {
          totalCustomers: customerCount.count,
          totalOrders: orderCount.count,
          assignedTickets: assignedTickets.count,
          openTickets: openTicketsCount.count,
          resolvedTickets: resolvedTicketsCount.count
        },
        latestCustomers,
        recentOrders,
        myTickets
      });
    }

    // Admin Dashboard (default original)
    const customerCount = await dbGet('SELECT COUNT(*) AS count FROM Customer');
    const orderCount = await dbGet('SELECT COUNT(*) AS count FROM Orders');
    const revenue = await dbGet('SELECT SUM(Amt) AS total FROM Payment');
    const productsAvailable = await dbGet('SELECT COUNT(*) AS count FROM Product WHERE Stock > 0');
    const pendingTickets = await dbGet("SELECT COUNT(*) AS count FROM SupportTicket WHERE Status IN ('Open', 'In Progress')");
    const avgRating = await dbGet('SELECT AVG(Rating) AS avg FROM Feedback');

    const recentOrders = await dbAll(`
      SELECT O.*, C.Name as CustomerName 
      FROM Orders O 
      JOIN Customer C ON O.CID = C.CID 
      ORDER BY O.ODt DESC, O.OID DESC 
      LIMIT 5
    `);

    const latestCustomers = await dbAll(`
      SELECT * FROM Customer 
      ORDER BY RegDt DESC, CID DESC 
      LIMIT 5
    `);

    const openTickets = await dbAll(`
      SELECT T.*, C.Name as CustomerName, E.Name as EmployeeName 
      FROM SupportTicket T
      JOIN Customer C ON T.CID = C.CID
      LEFT JOIN Employee E ON T.EID = E.EID
      WHERE T.Status IN ('Open', 'In Progress')
      ORDER BY T.CreatedDt DESC, T.TicketID DESC
      LIMIT 5
    `);

    const lowStockProducts = await dbAll(`
      SELECT * FROM Product 
      WHERE Stock < 30
      ORDER BY Stock ASC
      LIMIT 5
    `);

    const recentDeletions = await dbAll(`
      SELECT * FROM Customer_Audit 
      ORDER BY Deleted_Date DESC 
      LIMIT 5
    `);

    res.json({
      role: 'Admin',
      stats: {
        totalCustomers: customerCount.count,
        totalOrders: orderCount.count,
        totalRevenue: revenue.total || 0,
        productsAvailable: productsAvailable.count,
        pendingTickets: pendingTickets.count,
        averageRating: parseFloat((avgRating.avg || 0).toFixed(1))
      },
      recentOrders,
      latestCustomers,
      openTickets,
      lowStockProducts,
      recentDeletions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Customers Endpoints
app.get('/api/customers', async (req, res) => {
  try {
    const { search, type } = req.query;
    let query = 'SELECT * FROM Customer WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (Name LIKE ? OR Phone LIKE ? OR Email LIKE ? OR CID LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (type && type !== 'All Types') {
      query += ' AND CustomerType = ?';
      params.push(type);
    }

    query += ' ORDER BY CID ASC';
    const list = await dbAll(query, params);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await dbGet('SELECT * FROM Customer WHERE CID = ?', [id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Orders for customer
    const orders = await dbAll('SELECT * FROM Orders WHERE CID = ? ORDER BY ODt DESC', [id]);

    // Payments for customer
    const payments = await dbAll(`
      SELECT P.*, O.ODt 
      FROM Payment P 
      JOIN Orders O ON P.OID = O.OID 
      WHERE O.CID = ? 
      ORDER BY P.PayDt DESC
    `, [id]);

    // Support tickets for customer
    const tickets = await dbAll(`
      SELECT T.*, E.Name as EmployeeName 
      FROM SupportTicket T 
      LEFT JOIN Employee E ON T.EID = E.EID 
      WHERE T.CID = ? 
      ORDER BY T.CreatedDt DESC
    `, [id]);

    // Feedback from customer
    const feedback = await dbAll('SELECT * FROM Feedback WHERE CID = ? ORDER BY FbDt DESC', [id]);

    res.json({
      customer,
      orders,
      payments,
      tickets,
      feedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { Name, Email, Phone, Address, Gender, CustomerType } = req.body;
    const CID = await generateId('Customer', 'C', 'CID');
    const RegDt = new Date().toISOString().split('T')[0];

    await dbRun(
      'INSERT INTO Customer (CID, Name, Email, Phone, Address, Gender, RegDt, CustomerType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [CID, Name, Email, Phone, Address, Gender, RegDt, CustomerType]
    );

    const newCustomer = await dbGet('SELECT * FROM Customer WHERE CID = ?', [CID]);
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Email, Phone, Address, Gender, CustomerType } = req.body;

    await dbRun(
      'UPDATE Customer SET Name = ?, Email = ?, Phone = ?, Address = ?, Gender = ?, CustomerType = ? WHERE CID = ?',
      [Name, Email, Phone, Address, Gender, CustomerType, id]
    );

    const updated = await dbGet('SELECT * FROM Customer WHERE CID = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/customers/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM Customer WHERE CID = ?', [id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Products Endpoints
app.get('/api/products', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM Product WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (PName LIKE ? OR Category LIKE ? OR PID LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY PID ASC';
    const list = await dbAll(query, params);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const { PName, Category, Price, Stock } = req.body;
    const PID = await generateId('Product', 'P', 'PID');

    await dbRun(
      'INSERT INTO Product (PID, PName, Category, Price, Stock) VALUES (?, ?, ?, ?, ?)',
      [PID, PName, Category, Price, Stock]
    );

    const newProduct = await dbGet('SELECT * FROM Product WHERE PID = ?', [PID]);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { PName, Category, Price, Stock } = req.body;

    await dbRun(
      'UPDATE Product SET PName = ?, Category = ?, Price = ?, Stock = ? WHERE PID = ?',
      [PName, Category, Price, Stock, id]
    );

    const updated = await dbGet('SELECT * FROM Product WHERE PID = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/products/:id/stock', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { Stock } = req.body;

    await dbRun('UPDATE Product SET Stock = ? WHERE PID = ?', [Stock, id]);
    const updated = await dbGet('SELECT * FROM Product WHERE PID = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM Product WHERE PID = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Orders Endpoints
app.get('/api/orders', async (req, res) => {
  try {
    const list = await dbAll(`
      SELECT O.*, C.Name as CustomerName 
      FROM Orders O 
      JOIN Customer C ON O.CID = C.CID 
      ORDER BY O.ODt DESC, O.OID DESC
    `);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await dbGet(`
      SELECT O.*, C.Name as CustomerName, C.Email as CustomerEmail, C.Phone as CustomerPhone, C.Address as CustomerAddress
      FROM Orders O
      JOIN Customer C ON O.CID = C.CID
      WHERE O.OID = ?
    `, [id]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await dbAll(`
      SELECT OD.*, P.PName, P.Price, P.Category
      FROM OrderDetails OD
      JOIN Product P ON OD.PID = P.PID
      WHERE OD.OID = ?
    `, [id]);

    const payments = await dbAll('SELECT * FROM Payment WHERE OID = ? ORDER BY PayDt DESC', [id]);
    const feedback = await dbGet('SELECT * FROM Feedback WHERE OID = ?', [id]);

    res.json({
      order,
      items,
      payments,
      feedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { CID, items, PayMethod } = req.body; // items: [{ PID, Qty }]
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const OID = await generateId('Orders', 'O', 'OID');
    const ODt = new Date().toISOString().split('T')[0];

    // Calculate TotalAmt and verify stock inside a database transaction sequence
    db.serialize(async () => {
      try {
        let TotalAmt = 0;
        const detailsToInsert = [];

        for (const item of items) {
          const product = await dbGet('SELECT Price, Stock FROM Product WHERE PID = ?', [item.PID]);
          if (!product) {
            throw new Error(`Product ${item.PID} not found`);
          }
          if (product.Stock < item.Qty) {
            throw new Error(`Insufficient stock for product ${item.PID}`);
          }
          TotalAmt += product.Price * item.Qty;
          detailsToInsert.push({
            PID: item.PID,
            Qty: item.Qty,
            Price: product.Price,
            NewStock: product.Stock - item.Qty
          });
        }

        // Insert Order
        const orderStatus = PayMethod ? 'Completed' : 'Pending';
        await dbRun('INSERT INTO Orders (OID, ODt, TotalAmt, Status, CID) VALUES (?, ?, ?, ?, ?)', [
          OID,
          ODt,
          TotalAmt,
          orderStatus,
          CID
        ]);

        // Insert OrderDetails and update stock
        let startDetId = await generateId('OrderDetails', 'OD', 'ODID');
        for (const detail of detailsToInsert) {
          await dbRun('INSERT INTO OrderDetails (ODID, OID, PID, Qty) VALUES (?, ?, ?, ?)', [
            startDetId,
            OID,
            detail.PID,
            detail.Qty
          ]);
          await dbRun('UPDATE Product SET Stock = ? WHERE PID = ?', [detail.NewStock, detail.PID]);
          
          // Increment ODID code manually
          const num = parseInt(startDetId.substring(2), 10) + 1;
          startDetId = 'OD' + String(num).padStart(3, '0');
        }

        // Record Payment if PayMethod is supplied
        if (PayMethod) {
          const PayID = await generateId('Payment', 'PM', 'PayID');
          await dbRun('INSERT INTO Payment (PayID, PayDt, Amt, PayMethod, OID) VALUES (?, ?, ?, ?, ?)', [
            PayID,
            ODt,
            TotalAmt,
            PayMethod,
            OID
          ]);
        }

        const newOrder = await dbGet('SELECT * FROM Orders WHERE OID = ?', [OID]);
        res.status(201).json(newOrder);
      } catch (innerErr) {
        res.status(400).json({ error: innerErr.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Payments Endpoints
app.get('/api/payments', async (req, res) => {
  try {
    const { method } = req.query;
    let query = `
      SELECT P.*, O.CID, C.Name as CustomerName 
      FROM Payment P
      JOIN Orders O ON P.OID = O.OID
      JOIN Customer C ON O.CID = C.CID
    `;
    const params = [];

    if (method && method !== 'All Methods') {
      query += ' WHERE P.PayMethod = ?';
      params.push(method);
    }

    query += ' ORDER BY P.PayDt DESC, P.PayID DESC';
    const list = await dbAll(query, params);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const { OID, Amt, PayMethod } = req.body;
    const PayID = await generateId('Payment', 'PM', 'PayID');
    const PayDt = new Date().toISOString().split('T')[0];

    await dbRun('INSERT INTO Payment (PayID, PayDt, Amt, PayMethod, OID) VALUES (?, ?, ?, ?, ?)', [
      PayID,
      PayDt,
      Amt,
      PayMethod,
      OID
    ]);

    // Check if the order is now fully paid and update status
    const totalPayments = await dbGet('SELECT SUM(Amt) AS total FROM Payment WHERE OID = ?', [OID]);
    const order = await dbGet('SELECT TotalAmt FROM Orders WHERE OID = ?', [OID]);

    if (order && totalPayments.total >= order.TotalAmt) {
      await dbRun("UPDATE Orders SET Status = 'Completed' WHERE OID = ?", [OID]);
    }

    const newPayment = await dbGet('SELECT * FROM Payment WHERE PayID = ?', [PayID]);
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Support Tickets Endpoints
app.get('/api/tickets', async (req, res) => {
  try {
    const { role, eid } = getAuthUser(req);
    const { status } = req.query;
    
    let query = `
      SELECT T.*, C.Name as CustomerName, E.Name as EmployeeName 
      FROM SupportTicket T
      JOIN Customer C ON T.CID = C.CID
      LEFT JOIN Employee E ON T.EID = E.EID
    `;
    const params = [];

    // Filter tickets to show only assigned ones if Employee
    if (role === 'Employee') {
      query += ' WHERE T.EID = ?';
      params.push(eid);
      
      if (status && status !== 'All Statuses') {
        query += ' AND T.Status = ?';
        params.push(status);
      }
    } else {
      if (status && status !== 'All Statuses') {
        query += ' WHERE T.Status = ?';
        params.push(status);
      }
    }

    query += ' ORDER BY T.CreatedDt DESC, T.TicketID DESC';
    const list = await dbAll(query, params);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const { CID, EID, IssueType, Description } = req.body;
    const { role, eid } = getAuthUser(req);
    const TicketID = await generateId('SupportTicket', 'T', 'TicketID');
    const CreatedDt = new Date().toISOString().split('T')[0];
    const Status = 'Open';

    // If logged in as Employee, prevent assigning to others (it starts unassigned or self)
    const assigneeEid = role === 'Employee' ? null : EID;

    await dbRun(
      'INSERT INTO SupportTicket (TicketID, CID, EID, Status, IssueType, Description, CreatedDt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [TicketID, CID, assigneeEid, Status, IssueType, Description, CreatedDt]
    );

    const newTicket = await dbGet('SELECT * FROM SupportTicket WHERE TicketID = ?', [TicketID]);
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Status, EID, IssueType, Description } = req.body;
    const { role, eid } = getAuthUser(req);

    // Fetch original ticket first to check ownership and state
    const original = await dbGet('SELECT * FROM SupportTicket WHERE TicketID = ?', [id]);
    if (!original) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (role === 'Employee') {
      // 1. Employee cannot edit other employees' tickets
      if (original.EID !== eid) {
        return res.status(403).json({ error: 'Access Denied: You can only edit tickets assigned to you.' });
      }

      // 2. Employee cannot reassign tickets
      if (EID !== undefined && EID !== original.EID) {
        return res.status(403).json({ error: 'Access Denied: Employees cannot reassign support tickets.' });
      }

      // 3. Employee status transition check: Open -> In Progress -> Resolved -> Closed
      if (Status !== undefined) {
        const allowedTransitions = {
          'Open': ['Open', 'In Progress'],
          'In Progress': ['In Progress', 'Resolved'],
          'Resolved': ['Resolved', 'Closed'],
          'Closed': ['Closed']
        };
        const currentStatus = original.Status || 'Open';
        const allowed = allowedTransitions[currentStatus] || [];
        if (!allowed.includes(Status)) {
          return res.status(400).json({
            error: `Invalid status transition from ${currentStatus} to ${Status}. Status flow must be: Open -> In Progress -> Resolved -> Closed.`
          });
        }
      }
    }

    // Prepare fields to update
    let updateFields = [];
    let params = [];

    if (Status !== undefined) {
      updateFields.push('Status = ?');
      params.push(Status);
    }
    
    // Only Admin can assign/reassign EID, IssueType, Description
    if (role === 'Admin') {
      if (EID !== undefined) {
        updateFields.push('EID = ?');
        params.push(EID);
      }
      if (IssueType !== undefined) {
        updateFields.push('IssueType = ?');
        params.push(IssueType);
      }
      if (Description !== undefined) {
        updateFields.push('Description = ?');
        params.push(Description);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    await dbRun(`UPDATE SupportTicket SET ${updateFields.join(', ')} WHERE TicketID = ?`, params);
    
    const updated = await dbGet('SELECT * FROM SupportTicket WHERE TicketID = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Feedback Endpoints
app.get('/api/feedback', async (req, res) => {
  try {
    const { customerId, orderId } = req.query;
    let query = `
      SELECT F.*, C.Name as CustomerName 
      FROM Feedback F
      JOIN Customer C ON F.CID = C.CID
    `;
    const params = [];

    if (customerId) {
      query += ' WHERE F.CID = ?';
      params.push(customerId);
    } else if (orderId) {
      query += ' WHERE F.OID = ?';
      params.push(orderId);
    }

    query += ' ORDER BY F.FbDt DESC, F.FID DESC';
    const list = await dbAll(query, params);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { Rating, Comments, CID, OID } = req.body;
    const FID = await generateId('Feedback', 'F', 'FID');
    const FbDt = new Date().toISOString().split('T')[0];

    // Check if feedback already exists for this order
    const existing = await dbGet('SELECT FID FROM Feedback WHERE OID = ?', [OID]);
    if (existing) {
      return res.status(400).json({ error: 'Feedback already submitted for this order.' });
    }

    await dbRun(
      'INSERT INTO Feedback (FID, Rating, Comments, FbDt, CID, OID) VALUES (?, ?, ?, ?, ?, ?)',
      [FID, Rating, Comments, FbDt, CID, OID]
    );

    const newFb = await dbGet('SELECT * FROM Feedback WHERE FID = ?', [FID]);
    res.status(201).json(newFb);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Employees Endpoints

// Self Employee Profile (Me)
app.get('/api/employees/me', async (req, res) => {
  try {
    const { eid } = getAuthUser(req);
    if (!eid) {
      return res.status(400).json({ error: 'Missing Employee ID header' });
    }
    const emp = await dbGet('SELECT * FROM Employee WHERE EID = ?', [eid]);
    if (!emp) {
      return res.status(404).json({ error: 'Employee details not found' });
    }
    
    // Aggregate ticket numbers
    const assignedCount = await dbGet("SELECT COUNT(*) AS count FROM SupportTicket WHERE EID = ? AND Status != 'Closed'", [eid]);
    const resolvedCount = await dbGet("SELECT COUNT(*) AS count FROM SupportTicket WHERE EID = ? AND Status IN ('Resolved', 'Closed')", [eid]);

    res.json({
      ...emp,
      AssignedTickets: assignedCount.count,
      ResolvedTickets: resolvedCount.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees', requireAdmin, async (req, res) => {
  try {
    const list = await dbAll(`
      SELECT E.*, COUNT(CASE WHEN T.Status != 'Closed' THEN T.TicketID END) AS TicketCount
      FROM Employee E
      LEFT JOIN SupportTicket T ON E.EID = T.EID
      GROUP BY E.EID
      ORDER BY E.EID ASC
    `);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', requireAdmin, async (req, res) => {
  try {
    const { Name, Email, Phone, Address, Designation, Salary } = req.body;
    const EID = await generateId('Employee', 'E', 'EID');

    await dbRun(
      'INSERT INTO Employee (EID, Name, Email, Phone, Address, Designation, Salary) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [EID, Name, Email, Phone, Address, Designation, Salary]
    );

    const newEmp = await dbGet('SELECT * FROM Employee WHERE EID = ?', [EID]);
    res.status(201).json(newEmp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/employees/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Email, Phone, Address, Designation, Salary } = req.body;

    await dbRun(
      'UPDATE Employee SET Name = ?, Email = ?, Phone = ?, Address = ?, Designation = ?, Salary = ? WHERE EID = ?',
      [Name, Email, Phone, Address, Designation, Salary, id]
    );

    const updated = await dbGet('SELECT * FROM Employee WHERE EID = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM Employee WHERE EID = ?', [id]);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Activity Log Endpoint
app.get('/api/activity-log', requireAdmin, async (req, res) => {
  try {
    const list = await dbAll('SELECT * FROM Customer_Audit ORDER BY Deleted_Date DESC, rowid DESC');
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Analytical Reports
app.get('/api/reports', requireAdmin, async (req, res) => {
  try {
    const revenue = await dbGet('SELECT SUM(Amt) AS total FROM Payment');
    
    // Monthly orders
    const monthlyOrders = await dbAll(`
      SELECT strftime('%Y-%m', ODt) AS Month, COUNT(OID) AS OrderCount 
      FROM Orders 
      GROUP BY Month 
      ORDER BY Month ASC
    `);

    // Most sold product
    const mostSold = await dbGet(`
      SELECT P.PName, SUM(OD.Qty) as TotalSold 
      FROM OrderDetails OD 
      JOIN Product P ON OD.PID = P.PID 
      GROUP BY OD.PID 
      ORDER BY TotalSold DESC 
      LIMIT 1
    `);

    // Average customer satisfaction
    const avgRating = await dbGet('SELECT AVG(Rating) AS avg FROM Feedback');

    // Open tickets count
    const openTickets = await dbGet("SELECT COUNT(*) AS count FROM SupportTicket WHERE Status IN ('Open', 'In Progress')");

    res.json({
      totalRevenue: revenue.total || 0,
      monthlyOrders,
      mostSoldProduct: mostSold ? { name: mostSold.PName, qty: mostSold.TotalSold } : { name: 'N/A', qty: 0 },
      averageSatisfaction: parseFloat((avgRating.avg || 0).toFixed(1)),
      openTicketsCount: openTickets.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Universal Search Endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ customers: [], products: [], orders: [] });
    }

    const term = `%${q}%`;

    const customers = await dbAll(
      'SELECT CID, Name, Email, Phone FROM Customer WHERE Name LIKE ? OR Phone LIKE ? OR Email LIKE ? OR CID LIKE ? LIMIT 5',
      [term, term, term, term]
    );

    const products = await dbAll(
      'SELECT PID, PName, Category, Price FROM Product WHERE PName LIKE ? OR PID LIKE ? LIMIT 5',
      [term, term]
    );

    const orders = await dbAll(
      'SELECT OID, ODt, TotalAmt, Status, CID FROM Orders WHERE OID LIKE ? OR CID LIKE ? LIMIT 5',
      [term, term]
    );

    res.json({
      customers,
      products,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
