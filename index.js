const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Datastore for lightning deals
const lightningDeals = [
    {
      id: 1,
      productName: 'iPhone 13 Pro',
      actualPrice: 999,
      finalPrice: 899,
      totalUnits: 100,
      availableUnits: 50,
      expiryTime: moment().add(6, 'hours').utc().toDate(),
    },
    {
      id: 2,
      productName: 'Samsung Galaxy S21',
      actualPrice: 899,
      finalPrice: 799,
      totalUnits: 200,
      availableUnits: 100,
      expiryTime: moment().add(12, 'hours').utc().toDate(),
    },
    {
      id: 3,
      productName: 'Google Pixel 6',
      actualPrice: 799,
      finalPrice: 699,
      totalUnits: 50,
      availableUnits: 10,
      expiryTime: moment().add(8, 'hours').utc().toDate(),
    },
];

// Array to store orders
const orders = []

// Admin actions

// Create a new lightning deal
app.post('/admin/lightningDeals', (req, res) => {
  const newDeal = req.body;
  newDeal.expiryTime = moment(newDeal.expiryTime).utc().toDate(); // Convert expiry time to UTC Date
  lightningDeals.push(newDeal);
  res.status(201).json(newDeal);
});

// Update an existing lightning deal
app.put('/admin/lightningDeals/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updatedDeal = req.body;
  updatedDeal.expiryTime = moment(updatedDeal.expiryTime).utc().toDate(); // Convert expiry time to UTC Date
  const index = lightningDeals.findIndex((deal) => deal.id === id);
  if (index !== -1) {
    lightningDeals[index] = updatedDeal;
    res.status(200).json(updatedDeal);
  } else {
    res.status(404).send();
  }
});

// Approve an order
app.put('/admin/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const status = req.body.status;
  const index = orders.findIndex((order) => order.id === id);
  if (index !== -1) {
    orders[index].status = status;
    res.status(200).json(orders[index]);
  } else {
    res.status(404).send();
  }
});

// Customer actions

// Get all available unexpired lightning deals
app.get('/lightningDeals', (req, res) => {
  const currentTime = moment().utc();
  const unexpiredDeals = lightningDeals.filter((deal) => moment(deal.expiryTime).isAfter(currentTime));
  res.status(200).json(unexpiredDeals);
});

// Place a new order for a lightning deal
app.post('/orders', (req, res) => {
  const newOrder = req.body;
  const dealId = newOrder.dealId;
  const deal = lightningDeals.find((deal) => deal.id === dealId);
  if (deal && moment(deal.expiryTime).isAfter(moment().utc())) {
    newOrder.status = 'pending';
    newOrder.id = orders.length + 1;
    orders.push(newOrder);
    res.status(201).json(newOrder);
  } else {
    res.status(404).send();
  }
});

// Get the status of an order
app.get('/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const order = orders.find((order) => order.id === id);
  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404).send();
  }
});

// Start the server
app.listen(3001, () => {
  console.log('Server listening on port 3001');
});
