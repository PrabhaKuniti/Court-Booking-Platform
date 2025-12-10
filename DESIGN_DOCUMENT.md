# Database Design & Pricing Engine Architecture

## Database Design

### Schema Overview

The database is designed using MongoDB with Mongoose ODM. The schema follows a relational pattern despite using a NoSQL database, with references between collections for data integrity.

### Core Collections

#### 1. **User Collection**
Stores basic user information:
- `name`, `email`, `phone`
- Timestamps for creation/updates

**Design Decision**: Minimal user schema since authentication is not implemented. In production, add password hashing, roles, and authentication tokens.

#### 2. **Court Collection**
Represents the physical courts:
- `name`: Unique identifier (e.g., "Indoor Court 1")
- `type`: Enum ['indoor', 'outdoor']
- `basePrice`: Base hourly rate (used as starting point for pricing)
- `isActive`: Soft delete flag

**Design Decision**: Using `isActive` instead of hard deletes preserves historical booking data and allows easy reactivation.

#### 3. **Equipment Collection**
Manages rental equipment inventory:
- `name`, `type`: Enum ['racket', 'shoes']
- `totalStock`: Total available units
- `rentalPrice`: Per-hour rental cost
- `isActive`: Soft delete

**Design Decision**: Equipment availability is calculated dynamically by querying overlapping bookings, rather than maintaining a separate availability table. This ensures real-time accuracy.

#### 4. **Coach Collection**
Stores coach information and availability:
- `name`, `email`, `phone`
- `hourlyRate`: Coaching fee per hour
- `availability`: Array of weekly recurring slots
  - `dayOfWeek`: 0-6 (Sunday-Saturday)
  - `startTime`, `endTime`: HH:MM format
- `isActive`: Soft delete

**Design Decision**: Weekly recurring availability simplifies scheduling. For one-time unavailability (sick days), a separate `Unavailability` collection could be added.

#### 5. **Booking Collection** (Central Schema)
The heart of the system, linking all resources:
- `user`: Reference to User
- `court`: Reference to Court
- `startTime`, `endTime`: ISO date strings
- `resources`: Nested object
  - `rackets`, `shoes`: Quantities
  - `coach`: Optional reference to Coach
- `status`: Enum ['confirmed', 'cancelled', 'waitlist']
- `pricingBreakdown`: Complete price calculation details
  - `basePrice`, `courtPrice`, `equipmentPrice`, `coachPrice`
  - `appliedRules`: Array of rules that affected pricing
  - `total`: Final amount

**Design Decision**: Storing `pricingBreakdown` in the booking ensures historical accuracy. If pricing rules change later, past bookings retain their original pricing.

**Indexes**: 
- Compound index on `(court, startTime, endTime, status)` for fast availability queries
- Compound index on `(resources.coach, startTime, endTime, status)` for coach availability

#### 6. **PricingRule Collection**
Configurable pricing modifiers:
- `name`: Human-readable rule name
- `type`: Enum ['peak_hour', 'weekend', 'indoor_premium', 'holiday', 'custom']
- `isActive`: Enable/disable without deletion
- `modifier`: Object with `type` and `value`
  - Types: 'multiplier', 'fixed_add', 'fixed_subtract', 'percentage'
- Type-specific fields:
  - Peak hour: `startTime`, `endTime`
  - Weekend: `daysOfWeek` array
  - Indoor premium: `appliesTo` enum

**Design Decision**: Flexible rule structure allows adding new rule types without schema changes. The `isActive` flag enables A/B testing and gradual rollouts.

#### 7. **Waitlist Collection**
Manages queue for unavailable slots:
- `user`: Reference to User
- `court`: Reference to Court
- `preferredStartTime`, `preferredEndTime`: Desired slot
- `resources`: Same structure as Booking
- `notified`: Boolean flag
- `position`: Queue position

**Design Decision**: Position-based queue ensures FIFO ordering. When a cancellation occurs, the first non-notified entry is selected.

### Relationships

```
User ──┐
       │
       ├──> Booking ──> Court
       │              └──> Equipment (via quantities)
       │              └──> Coach (optional)
       │
       └──> Waitlist ──> Court
```

### Data Integrity

1. **Atomic Transactions**: MongoDB sessions ensure all-or-nothing booking creation
2. **Referential Integrity**: Mongoose populate() validates references
3. **Availability Validation**: Pre-booking checks prevent double bookings
4. **Soft Deletes**: `isActive` flags preserve data integrity

## Pricing Engine Architecture

### Design Philosophy

The pricing engine is **rule-driven** and **stackable**. Instead of hardcoded if-else statements, pricing rules are stored in the database and evaluated dynamically. Rules can stack (e.g., peak hour + weekend + indoor premium all apply simultaneously).

### Calculation Flow

```
1. Fetch base price from Court
2. Calculate base court price = basePrice × duration
3. Fetch all active PricingRules
4. For each rule:
   a. Check if rule applies (time, day, court type, etc.)
   b. If applicable, apply modifier
   c. Track in appliedRules array
5. Calculate equipment costs = sum(quantity × rentalPrice × duration)
6. Calculate coach cost = hourlyRate × duration (if selected)
7. Sum all components = total
```

### Rule Evaluation

Each rule type has specific evaluation logic:

**Peak Hour Rule:**
- Compares booking time against `startTime` and `endTime`
- Handles edge cases (e.g., peak hours spanning midnight)

**Weekend Rule:**
- Checks `dayOfWeek` against `daysOfWeek` array
- Defaults to Saturday (6) and Sunday (0) if array is empty

**Indoor Premium:**
- Checks `appliesTo` field ('all', 'indoor', 'outdoor')
- Only applies if court type matches

**Holiday Rule:**
- Compares booking date against `specificDates` array
- Allows for one-time special pricing

### Modifier Types

1. **Multiplier**: `newPrice = oldPrice × value`
   - Example: 1.5 multiplier = 50% increase
   - Applied amount tracked: `(value - 1) × oldPrice`

2. **Fixed Add**: `newPrice = oldPrice + value`
   - Example: Add $5 for indoor courts

3. **Fixed Subtract**: `newPrice = oldPrice - value`
   - Example: Discount for members

4. **Percentage**: `newPrice = oldPrice + (oldPrice × value / 100)`
   - Example: 10% surcharge

### Stacking Logic

Rules are applied **sequentially** in the order they're fetched from the database. Each rule modifies the current price, and subsequent rules operate on the modified value. This allows for complex pricing scenarios:

**Example:**
- Base price: $10/hr
- Peak hour (1.5x): $15/hr
- Weekend (1.3x): $19.50/hr
- Indoor premium (+$5): $24.50/hr

**Design Decision**: Sequential application is simpler than parallel application with conflict resolution. Admin can control order by enabling/disabling rules or using priority fields (future enhancement).

### Price Breakdown Storage

The complete pricing breakdown is stored in each booking:
- Enables transparency for users
- Preserves historical pricing (rules may change)
- Supports refund calculations
- Aids in debugging pricing issues

### Performance Considerations

1. **Rule Caching**: In production, cache active rules in memory with TTL
2. **Indexed Queries**: Pricing rule queries use `isActive` index
3. **Lazy Evaluation**: Rules are only evaluated when needed (during booking creation)
4. **Pre-calculation**: Price is calculated before booking creation to show user

### Extensibility

The pricing engine can be extended by:
1. Adding new rule types to the `PricingRule` schema
2. Implementing evaluation logic in `priceCalculator.js`
3. No changes needed to booking creation flow

**Future Enhancements:**
- Rule priority/ordering
- Rule conflicts and resolution strategies
- Time-based rule activation (e.g., seasonal pricing)
- User-specific pricing (member discounts)
- Bulk booking discounts

## Availability Checking

### Multi-Resource Validation

Before creating a booking, the system checks:
1. **Court Availability**: No overlapping confirmed bookings
2. **Equipment Availability**: Sufficient stock after subtracting booked quantities
3. **Coach Availability**: 
   - Coach is active
   - Coach has availability for the day/time
   - No overlapping bookings

### Query Optimization

Availability queries use:
- Compound indexes on `(resource, startTime, endTime, status)`
- Efficient overlap detection: `startTime < newEndTime AND endTime > newStartTime`
- Single query per resource type (no N+1 problem)

### Atomicity

MongoDB transactions ensure:
- All resources are checked and reserved atomically
- If any resource is unavailable, the entire booking fails
- No partial bookings are created

### Concurrency Handling

1. **Database Transactions**: MongoDB sessions prevent race conditions
2. **Optimistic Locking**: Could be added using version fields
3. **Queue System**: For high concurrency, implement a booking queue

## Conclusion

The database design prioritizes:
- **Flexibility**: Easy to add new resource types or pricing rules
- **Integrity**: Atomic transactions and validation prevent data corruption
- **Performance**: Indexed queries and efficient availability checks
- **Maintainability**: Clear separation of concerns and modular code

The pricing engine emphasizes:
- **Configurability**: Business rules stored in database, not code
- **Transparency**: Complete price breakdown for users
- **Extensibility**: Easy to add new rule types
- **Stackability**: Multiple rules can apply simultaneously

This architecture supports the current requirements while providing a foundation for future enhancements.

