# Database Models & Schema Specification

The application uses **PostgreSQL** as the primary datastore, integrated with the backend service through the **GORM ORM**. GORM is configured to perform **Auto-Migrations** on system boot, ensuring the database schemas are kept in sync with the Go structures.

---

## 🔑 Custom Primary Key Strategy (UUID)

To avoid exposing auto-incremented integer IDs in URLs and API payloads, the system implements a custom UUID primary key strategy. This is achieved via a custom `BaseModel` that replaces `gorm.Model`.

### `BaseModel` Struct (`backend/internal/models/base.go`)
Each data model in the system embeds this `BaseModel` to inherit UUID keys and standard timestamps.

| Field Name | Data Type | Database Type | GORM Annotations | Description |
|---|---|---|---|---|
| `ID` | `uuid.UUID` | `uuid` | `type:uuid;primaryKey` | Unique identifier (UUID v4) |
| `CreatedAt` | `time.Time` | `timestamp` | - | Date/Time of creation |
| `UpdatedAt` | `time.Time` | `timestamp` | - | Date/Time of last update |
| `DeletedAt` | `gorm.DeletedAt`| `timestamp` | `index` | Soft delete timestamp (hidden in JSON) |

#### Hook Hooking:
A GORM hook `BeforeCreate` is defined on `BaseModel` to auto-generate a new random UUID v4 if the ID field is empty prior to record insertion.

---

## 🗄️ Database Schemas

### 1. User Model (`backend/internal/models/user.go`)
Represents an authenticated account in the system (either a customer ordering food or a restaurant owner managing their store).

| Field Name | Go Type | Database Type | GORM Annotations | Description |
|---|---|---|---|---|
| `Name` | `string` | `varchar(100)` | `not null` | User's full name |
| `Email` | `string` | `varchar(100)` | `uniqueIndex;not null` | Email address used for authentication |
| `Password` | `string` | `varchar(255)` | `not null` | BCrypt hashed password (omitted in JSON) |
| `Role` | `string` | `varchar(50)` | `not null` | Authorization role: `"customer"` or `"restaurant_owner"` |

---

### 2. Restaurant Model (`backend/internal/models/restaurant.go`)
Stores details about physical restaurant locations registered by owners.

| Field Name | Go Type | Database Type | GORM Annotations | Description |
|---|---|---|---|---|
| `OwnerID` | `uuid.UUID` | `uuid` | `not null;index` | Foreign Key pointing to the owning User |
| `Name` | `string` | `varchar(150)` | `not null;index` | Restaurant name |
| `Description` | `string` | `text` | - | Restaurant bio / descriptive copy |
| `Address` | `string` | `varchar(255)` | `not null` | Street address of the restaurant |
| `City` | `string` | `varchar(100)` | `not null;index` | City location for regional searching |
| `OpeningTime` | `string` | `varchar(20)` | `not null` | Operational opening time (e.g. `"09:00"`) |
| `ClosingTime` | `string` | `varchar(20)` | `not null` | Operational closing time (e.g. `"22:00"`) |
| `Image` | `string` | `varchar(255)` | - | Path/URL to the uploaded cover photo |

#### Relationships:
- **Owner**: `User` belongs to this restaurant via `OwnerID`. Cascades updates/deletions.

---

### 3. Food Model (`backend/internal/models/food.go`)
Represents individual menu items listed under a specific restaurant.

| Field Name | Go Type | Database Type | GORM Annotations | Description |
|---|---|---|---|---|
| `RestaurantID`| `uuid.UUID` | `uuid` | `not null;index` | Foreign Key pointing to parent Restaurant |
| `CategoryID` | `*uuid.UUID` | `uuid` | `index` | Nullable Foreign Key pointing to Category |
| `Name` | `string` | `varchar(150)` | `not null;index` | Food item title (e.g., `"Pepperoni Pizza"`) |
| `Description` | `string` | `text` | - | Brief description of ingredients / portion sizes |
| `Price` | `float64` | `decimal(10,2)`| `not null` | Unit price of the item |
| `Image` | `string` | `varchar(255)` | - | Image path for menu card UI |
| `Availability`| `bool` | `boolean` | `default:true;not null`| Is item currently in stock/active |

#### Relationships:
- **Restaurant**: `Restaurant` parent. Cascades updates/deletions.
- **Category**: Optional `Category` association. Setting `CategoryID` to NULL does not delete the food item.

---

### 4. Category Model (`backend/internal/models/category.go`)
A classification entity allowing food items to be filtered or grouped (e.g., Pizza, Dessert, Beverages).

| Field Name | Go Type | Database Type | GORM Annotations | Description |
|---|---|---|---|---|
| `Name` | `string` | `varchar(100)` | `uniqueIndex;not null` | Category title |

---

### 5. Address Model (`backend/internal/models/address.go`)
Represents delivery destinations saved in customer profiles.

| Field Name | Go Type | Database Type | GORM Annotations | Description |
|---|---|---|---|---|
| `UserID` | `uuid.UUID` | `uuid` | `not null;index` | Foreign Key pointing to the Customer |
| `Title` | `string` | `varchar(50)` | `not null` | Alias (e.g., `"Home"`, `"Work"`) |
| `StreetAddress`| `string` | `varchar(255)` | `not null` | Detailed address line |
| `City` | `string` | `varchar(100)` | `not null;index` | City location |
| `State` | `string` | `varchar(100)` | `not null` | State / Region |
| `PostalCode` | `string` | `varchar(20)` | `not null` | Zip/Postal code |

---

### 6. Cart & CartItem Models (`backend/internal/models/cart.go`)
Handles shopping cart state persistence for customers.

#### Cart
| Field Name | Go Type | Database Type | GORM Annotations | Description |
|---|---|---|---|---|
| `UserID` | `uuid.UUID` | `uuid` | `not null;uniqueIndex` | User ID association (one Cart per User) |

#### CartItem
| Field Name | Go Type | Database Type | GORM Annotations | Description |
|---|---|---|---|---|
| `CartID` | `uuid.UUID` | `uuid` | `not null;index` | Parent Cart ID |
| `FoodID` | `uuid.UUID` | `uuid` | `not null;index` | Reference to the selected Food item |
| `Quantity` | `int` | `integer` | `not null;default:1` | Number of servings added |

#### Relationships:
- **Cart**: Associated with a list of `CartItems` via `CartID` foreign key.
- **CartItem**: Belongs to `Food` via `FoodID` reference.

---

### 7. Order & OrderItem Models (`backend/internal/models/order.go`)
Stores checkout and delivery transactions.

#### Order
| Field Name | Go Type | Database Type | GORM Annotations | Description |
|---|---|---|---|---|
| `UserID` | `uuid.UUID` | `uuid` | `not null;index` | Customer placing the order |
| `RestaurantID`| `uuid.UUID` | `uuid` | `not null;index` | Restaurant fullfilling the order |
| `AddressID` | `uuid.UUID` | `uuid` | `not null;index` | Delivery address choice |
| `Status` | `string` | `varchar(50)` | `default:'Pending';not null;index`| Progress: `"Pending"`, `"Accepted"`, `"Preparing"`, `"Out For Delivery"`, `"Delivered"`, `"Cancelled"` |
| `TotalPrice` | `float64` | `decimal(10,2)`| `not null` | Cumulative price of checkout |
| `PaymentMethod`| `string` | `varchar(50)` | `default:'COD';not null` | Payment style (e.g. `"COD"` - Cash On Delivery) |

#### OrderItem
| Field Name | Go Type | Database Type | GORM Annotations | Description |
|---|---|---|---|---|
| `OrderID` | `uuid.UUID` | `uuid` | `not null;index` | Parent Order reference |
| `FoodID` | `uuid.UUID` | `uuid` | `not null;index` | Purchased Food item reference |
| `Quantity` | `int` | `integer` | `not null` | Purchased quantity |
| `Price` | `float64` | `decimal(10,2)`| `not null` | Unit price locked at the time of purchase |

#### Relationships:
- **Order Constraints**: Uses `OnDelete:RESTRICT` for critical dependencies (`User`, `Restaurant`, `Address`) to prevent accidental deletion of historical order records.
- **OrderItems**: Lists all ordered elements under the order ID via `OrderID`.

---

### 8. Review Model (`backend/internal/models/review.go`)
User reviews/ratings submitted for specific restaurants.

| Field Name | Go Type | Database Type | GORM Annotations | Description |
|---|---|---|---|---|
| `UserID` | `uuid.UUID` | `uuid` | `not null;index` | Authoring customer ID |
| `RestaurantID`| `uuid.UUID` | `uuid` | `not null;index` | Reviewed Restaurant ID |
| `Rating` | `int` | `integer` | `not null` | Rating points given (scale `1` to `5`) |
| `Comment` | `string` | `text` | - | Review narrative text |

---

## 📊 Database Relationships ERD

```mermaid
erDiagram
    USER ||--oO RESTAURANT : "owns (1-to-1)"
    USER ||--o{ ADDRESS : "saves (1-to-many)"
    USER ||--o{ ORDER : "places (1-to-many)"
    USER ||--o{ REVIEW : "writes (1-to-many)"
    USER ||--o| CART : "has (1-to-1)"
    
    RESTAURANT ||--o{ FOOD : "offers (1-to-many)"
    RESTAURANT ||--o{ ORDER : "receives (1-to-many)"
    RESTAURANT ||--o{ REVIEW : "gets (1-to-many)"
    
    CATEGORY ||--o{ FOOD : "groups (1-to-many)"
    
    CART ||--o{ CART-ITEM : "contains (1-to-many)"
    FOOD ||--o{ CART-ITEM : "referenced-by (1-to-many)"
    
    ORDER ||--o{ ORDER-ITEM : "contains (1-to-many)"
    FOOD ||--o{ ORDER-ITEM : "referenced-by (1-to-many)"
    ADDRESS ||--o{ ORDER : "destination-for (1-to-many)"
```
