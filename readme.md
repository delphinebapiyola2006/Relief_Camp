# ReliefCamp – Disaster Relief Camp Resource Tracker

> A web-based disaster relief camp management system designed to efficiently manage camp capacity, relief supplies, families, and resource distribution in a centralized platform.

---

## 📌 Project Overview

During natural disasters and emergency situations, relief camps need to manage a large number of families, essential supplies, and available accommodation capacity.

Manual management of these resources can lead to inaccurate inventory records, over-allocation of camp capacity, delayed distribution, and difficulty in tracking currently housed families.

**ReliefCamp** provides a centralized digital platform for managing disaster relief camp resources. The system enables authorities or camp administrators to register camps, manage relief supplies, register incoming families, distribute resources, and monitor the current camp status.

The system also includes validation mechanisms to prevent:

- Distribution of supplies beyond available inventory.
- Registration of families beyond the remaining camp capacity.

---

## 🎯 Problem Statement

Disaster relief camps often depend on manual or disconnected methods to track essential resources and families.

This creates challenges such as:

- Difficulty in maintaining accurate inventory levels.
- Risk of distributing more supplies than available.
- Lack of real-time visibility of camp occupancy.
- Difficulty in tracking families currently staying in a camp.
- Manual calculation of remaining camp capacity.
- Lack of centralized resource management.

ReliefCamp addresses these challenges through a centralized web-based resource tracking system.

---

## 💡 Proposed Solution

ReliefCamp digitizes the core operations of a disaster relief camp.

The system allows administrators to:

1. Register and manage relief camps.
2. Define the maximum capacity of each camp.
3. Record incoming relief supplies.
4. Track available Food, Water, and Blankets.
5. Register families entering the camp.
6. Automatically update camp occupancy.
7. Distribute supplies to registered families.
8. Automatically reduce inventory after distribution.
9. Validate supply availability before distribution.
10. Validate remaining capacity before registering families.
11. View current camp inventory and housed families.

---

## ✨ Key Features

### 🏕️ Camp Management

- Register new relief camps.
- Store camp name, location, and capacity.
- Track current occupancy.
- Calculate remaining camp capacity.

### 📦 Supply Management

Supports essential relief resources such as:

- Food
- Water
- Blankets

Administrators can record incoming quantities and monitor the current inventory.

### 👨‍👩‍👧 Family Management

- Register families entering a relief camp.
- Record family name and headcount.
- Automatically update camp occupancy.
- Maintain a list of currently housed families.

### 🚚 Supply Distribution

- Select a registered family.
- Select the required supply.
- Enter the quantity to distribute.
- Record the distribution.
- Automatically reduce the available inventory.

### 🛡️ Validation & Resource Protection

The system includes important business rules:

**Capacity Validation**

A family cannot be registered if its headcount exceeds the remaining camp capacity.

**Inventory Validation**

A supply cannot be distributed if the requested quantity exceeds the available inventory.

These validations help prevent resource mismanagement during emergency situations.

---

## 🔄 System Workflow

```text
Start
  ↓
Register / Select Relief Camp
  ↓
Enter Camp Details
(Name, Location, Capacity)
  ↓
Camp Created
  ↓
Add Relief Supplies
(Food / Water / Blankets)
  ↓
Update Inventory
  ↓
Register Incoming Family
(Name, Headcount)
  ↓
Check Remaining Capacity
  ↓
Capacity Available?
 ┌───────────────┐
 │               │
YES              NO
 │               │
 ↓               ↓
Register       Reject
Family         Registration
 │
 ↓
Update Occupancy
 │
 ↓
Select Supply
 │
 ↓
Check Inventory
 │
 ↓
Sufficient Quantity?
 ┌───────────────┐
 │               │
YES              NO
 │               │
 ↓               ↓
Distribute      Reject
Supply          Distribution
 │
 ↓
Reduce Inventory
 │
 ↓
Update Camp Records
 │
 ↓
Display Current Status
 │
 ↓
End