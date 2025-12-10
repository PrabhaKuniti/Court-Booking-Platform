const PricingRule = require('../models/PricingRule');
const Court = require('../models/Court');

/**
 * Calculate the total price for a booking based on configurable pricing rules
 * Rules can stack (e.g., peak hour + weekend + indoor premium)
 */
async function calculatePrice(courtId, startTime, endTime, equipmentCount = {}, coachId = null) {
  const court = await Court.findById(courtId);
  if (!court) {
    throw new Error('Court not found');
  }

  // Get all active pricing rules
  const rules = await PricingRule.find({ isActive: true });

  let basePrice = court.basePrice;
  const durationHours = (endTime - startTime) / (1000 * 60 * 60);
  let courtPrice = basePrice * durationHours;

  const appliedRules = [];
  const bookingDate = new Date(startTime);
  const hour = bookingDate.getHours();
  const dayOfWeek = bookingDate.getDay(); // 0 = Sunday, 6 = Saturday
  const dateStr = bookingDate.toISOString().split('T')[0];

  // Apply each rule that matches
  for (const rule of rules) {
    let shouldApply = false;

    switch (rule.type) {
      case 'peak_hour':
        if (rule.startTime && rule.endTime) {
          const [startH, startM] = rule.startTime.split(':').map(Number);
          const [endH, endM] = rule.endTime.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          const currentMinutes = hour * 60 + bookingDate.getMinutes();
          
          // Handle cases where peak hours span midnight
          if (startMinutes < endMinutes) {
            shouldApply = currentMinutes >= startMinutes && currentMinutes < endMinutes;
          } else {
            shouldApply = currentMinutes >= startMinutes || currentMinutes < endMinutes;
          }
        }
        break;

      case 'weekend':
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          shouldApply = rule.daysOfWeek.includes(dayOfWeek);
        } else {
          // Default weekend: Saturday (6) or Sunday (0)
          shouldApply = dayOfWeek === 0 || dayOfWeek === 6;
        }
        break;

      case 'indoor_premium':
        shouldApply = rule.appliesTo === 'all' || 
                      (rule.appliesTo === 'indoor' && court.type === 'indoor') ||
                      (rule.appliesTo === 'outdoor' && court.type === 'outdoor');
        break;

      case 'holiday':
        if (rule.specificDates && rule.specificDates.length > 0) {
          shouldApply = rule.specificDates.some(date => {
            const ruleDateStr = new Date(date).toISOString().split('T')[0];
            return ruleDateStr === dateStr;
          });
        }
        break;

      case 'custom':
        // Custom rules can be extended based on specific business logic
        shouldApply = true;
        break;
    }

    if (shouldApply) {
      const modifier = rule.modifier;
      let amount = 0;

      switch (modifier.type) {
        case 'multiplier':
          amount = courtPrice * (modifier.value - 1); // Only the additional amount
          courtPrice = courtPrice * modifier.value;
          break;

        case 'fixed_add':
          amount = modifier.value;
          courtPrice += modifier.value;
          break;

        case 'fixed_subtract':
          amount = -modifier.value;
          courtPrice -= modifier.value;
          break;

        case 'percentage':
          amount = courtPrice * (modifier.value / 100);
          courtPrice += amount;
          break;
      }

      appliedRules.push({
        ruleName: rule.name,
        modifier: modifier.type,
        value: modifier.value,
        amount: amount,
      });
    }
  }

  // Calculate equipment costs
  let equipmentPrice = 0;
  const Equipment = require('../models/Equipment');
  
  if (equipmentCount.rackets > 0) {
    const racket = await Equipment.findOne({ type: 'racket', isActive: true });
    if (racket) {
      equipmentPrice += racket.rentalPrice * equipmentCount.rackets * durationHours;
    }
  }

  if (equipmentCount.shoes > 0) {
    const shoes = await Equipment.findOne({ type: 'shoes', isActive: true });
    if (shoes) {
      equipmentPrice += shoes.rentalPrice * equipmentCount.shoes * durationHours;
    }
  }

  // Calculate coach cost
  let coachPrice = 0;
  if (coachId) {
    const Coach = require('../models/Coach');
    const coach = await Coach.findById(coachId);
    if (coach) {
      coachPrice = coach.hourlyRate * durationHours;
    }
  }

  const total = courtPrice + equipmentPrice + coachPrice;

  return {
    basePrice: basePrice,
    courtPrice: Math.round(courtPrice * 100) / 100,
    equipmentPrice: Math.round(equipmentPrice * 100) / 100,
    coachPrice: Math.round(coachPrice * 100) / 100,
    appliedRules: appliedRules,
    total: Math.round(total * 100) / 100,
  };
}

module.exports = { calculatePrice };

