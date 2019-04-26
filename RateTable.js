function parseZone (zone) {
  if (!zone) return [ ];

  const zones = zone.split(',');
  return zones.map(zone => {
    if (!/\-/.test(zone)) return zone;

    const [ , letter, begin, end ] = /([A-Z]+)(\d+)\-[A-Z]+(\d+)/.exec(zone);
    const zoneRange = [ ];

    for (let i = parseInt(begin); i <= parseInt(end); i++) {
      zoneRange.push(`${letter}${i}`);
    }

    return zoneRange;

  }).reduce((flattened, zoneRange) => {
    if (Array.isArray(zoneRange)) return flattened.concat(zoneRange);
    return flattened.concat([ zoneRange ]);
  }, [ ]);
}

class RateTable {

  constructor (rateTable) {
    this.table = rateTable;
  }

  validateRateQuery (params) {

  }

  compareRule (rule, value) {
    if (!rule) return true;
    if (!isNaN(parseInt(rule))) {
      return parseInt(rule) === value;
    }
    if (/^[<>=]+/.test(rule)) {
      const [ , comparator, operand ] = /^([<>=]+)(\-?\d)$/.exec(rule)

      if (comparator === '>') return value > parseInt(operand);
      if (comparator === '>=') return value >= parseInt(operand);
      if (comparator === '<') return value < parseInt(operand);
      if (comparator === '<=') return value <= parseInt(operand);
    }
    
    const [ , low, high ] = /^(\-?\d+)\-(\-?\d+)$/.exec(rule);

    return parseInt(low) <= value && parseInt(high) >= value;
  }

  getPreferredRiskRates (params) {

  }

  getNewlyMappedRates (params) {

  }

  getPremium (params) {
    const {
      building_deductible,
      contents_deductible,
      building_coverage,
      contents_coverage
    } = params;

    const premium = { };

    const rates = this.getRates(params);
    const limits = this.getLimits(params);
    const deductibles = this.getDeductibles(params);
    const deductibleFactor = this.getDeductibleFactor(params, deductibles);

    console.log('limits', limits);
    console.log('deductibles', deductibles);

    // 1. get base premium - multiply coverage with determined rate
    const building_basic = Math.min(limits.building_basic, building_coverage);
    const building_additional = building_coverage - limits.building_basic;
    const contents_basic = Math.min(limits.contents_basic, contents_coverage);
    const contents_additional = contents_coverage - limits.contents_basic;
    premium.building_basic = rates.building_basic * (building_basic / 100)
    premium.building_additional = Math.max(0, rates.building_additional * (building_additional / 100));
    premium.contents_basic = rates.contents_basic * (contents_basic / 100);
    premium.contents_additional = Math.max(0, rates.contents_additional * (contents_additional / 100));

    // 2. apply deductible factor
    premium.deductible_factor = deductibleFactor;
    premium.building_subtotal = Math.round((premium.building_basic + premium.building_additional) * deductibleFactor);
    premium.contents_subtotal = Math.round((premium.contents_basic + premium.contents_additional) * deductibleFactor);
    premium.combined_subtotal = premium.building_subtotal + premium.contents_subtotal;

    // 3. add ICC premium
    premium.icc_premium = 0;

    // 4. add CRS discount
    premium.crs_discount = 0;

    // 5. add reserve fund assessment
    premium.reserve_fund_assessment = premium.combined_subtotal * 0.15;

    // 6. add probation surcharge
    premium.probation_surcharge = 0;

    // 7. add HFIAA surcharge
    if (params.residence_type === 'primary_residence') {
      premium.hfiaa_surcharge = 25;
    }
    else {
      premium.hfiaa_surcharge = 250;
    }
    
    // 8. add federal policy fee
    if (/^PRP/.test(rates.table)) {
      premium.federal_policy_fee = 25;
    }
    else {
      premium.federal_policy_fee = 50;
    }

    premium.combined_total = premium.combined_subtotal +
      premium.reserve_fund_assessment +
      premium.hfiaa_surcharge +
      premium.icc_premium +
      premium.crs_discount +
      premium.probation_surcharge +
      premium.federal_policy_fee;

    console.log('premium', premium);
    return premium;
  }
  
  getLimits (params) {
    const { occupancy_type, program_type } = params;

    return this.table.limits.find(limit => {
      return limit.occupancy_type === occupancy_type && limit.program_type === program_type;
    });
  }

  getDeductibleFactor (params, deductibles) {
    if (params.construction_date === 'pre_firm') {
      return deductibles.deductible_factor_subsidized;
    }
    else {
      return deductibles.deductible_factor_full_risk;
    }
  }

  getDeductibles (params) {
    const {
      building_deductible,
      contents_deductible,
      occupancy_type
    } = params;

    return this.table.deductibles.find(row => {
      return row.occupancy_type === occupancy_type &&
        row.contents_deductible === contents_deductible &&
        row.building_deductible === building_deductible;
    });

  }

  getRates (params) {
    const lookupTable = this.getLookupTable(params);
    const {
      occupancy_type,
      residence_type,
      building_type,
      firm_zone,
      certification,
      elevation_above_bfe,
      replacement_cost_ratio,
      floors,
      contents_location
    } = params;

    const building = this.table.rates[lookupTable]
      .find(rate => {
        return [
          rate.building_basic && rate.building_additional,
          !rate.building_type || (rate.building_type === building_type),
          !rate.occupancy_type || (rate.occupancy_type === occupancy_type),
          !rate.certification || (rate.certification === certification),
          !rate.replacement_cost_ratio || (rate.replacement_cost_ratio === replacement_cost_ratio),
          this.compareRule(rate.elevation_above_bfe, elevation_above_bfe),
          this.compareRule(rate.floors, floors),
          !rate.firm_zone.length || (parseZone(rate.firm_zone).includes(firm_zone))
        ].every(r => r);
      });

    const contents = this.table.rates[lookupTable]
      .find(rate => {
        return (rate.contents_basic && rate.contents_additional) &&
          (!rate.building_type || (rate.building_type === building_type)) &&
          (!rate.occupancy_type || (rate.occupancy_type === occupancy_type)) &&
          (!rate.contents_location || (rate.contents_location === contents_location)) &&
          (!rate.certification || (rate.certification === certification)) &&
          (this.compareRule(rate.floors, floors)) &&
          (this.compareRule(rate.elevation_above_bfe, elevation_above_bfe)) &&
          (!rate.firm_zone.length || (parseZone(rate.firm_zone).includes(firm_zone)));
      }) || { };

    return {
      table: lookupTable,
      building_basic: building.building_basic,
      building_additional: building.building_additional,
      contents_basic: contents.contents_basic,
      contents_additional: contents.contents_additional
    };
  }

  getLookupTable ({ firm_zone, construction_date, residence_type, srl_property, substantially_improved, program_type, elevation_above_bfe, building_type }) {
    const hasElevationData = Number.isFinite(elevation_above_bfe);
    if (hasElevationData && construction_date === 'pre_firm') {
      construction_date = 'post_firm'
    }

    const found = this.table.lookupTable.find(row => {
      return (row.program_type === program_type) &&
        ((row.construction_date === construction_date) || !row.construction_date) &&
        ((row.building_type === building_type) || !row.building_type) &&
        ((row.residence_type === residence_type) || !row.residence_type) &&
        ((row.srl_property === srl_property) || row.srl_property === null) &&
        ((row.substantially_improved === substantially_improved) || row.substantially_improved === null) &&
        (!row.firm_zone.length || (parseZone(row.firm_zone).includes(firm_zone)));
    });

    return found.firm_table;
  }
}

module.exports = RateTable;
