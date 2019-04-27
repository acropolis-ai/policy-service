function isElevated (params) {
  if (/^with_/.test(params.building_type)) {
    return true;
  }
  if (/^elevated/.test(params.building_type)) {
    return true;
  }
  else {
    return false;
  }
}
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

function parseRateTable (table) {
  if (!table) return [ ];

  return table.split(',');
}

function getCrsDiscount (crsRating) {
  if (!crsRating) return 0;
  return (10 - crsRating) * .05;
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
      const [ , comparator, operand ] = /^([<>=]+)(\-?\d+)$/.exec(rule)

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
      contents_coverage,
      crs_rating
    } = params;

    const rates = this.getRates(params);
    const limits = this.getLimits(params);
    const policy = this.getPolicy(params, building_coverage);
    const deductibles = this.getDeductibles(params);
    const deductibleFactor = this.getDeductibleFactor(deductibles, policy);
    const iccPremium = this.getIccPremium(params, rates.rate_table);
    let subtotal = 0;

    const premium = {
      rate_table: rates.rate_table
    };

    //console.log('limits', limits);
    //console.log('deductibles', deductibles);
    //console.log('policy', policy);

    // 1. get base premium - multiply coverage with determined rate
    const building_basic = Math.min(limits.building_basic, building_coverage);
    const building_additional = building_coverage - limits.building_basic;
    const contents_basic = Math.min(limits.contents_basic, contents_coverage);
    const contents_additional = contents_coverage - limits.contents_basic;
    premium.building_basic_amount = building_basic;
    premium.building_additional_amount = building_additional;
    premium.contents_basic_amount = contents_basic;
    premium.contents_additional_amount = contents_additional;
    premium.building_basic = Math.round(rates.building_basic * (building_basic / 100));
    premium.building_additional = Math.round(Math.max(0, rates.building_additional * (building_additional / 100)));
    premium.contents_basic = Math.round(rates.contents_basic * (contents_basic / 100));
    premium.contents_additional = Math.round(Math.max(0, rates.contents_additional * (contents_additional / 100)));

    // 2. apply deductible factor
    premium.deductible_factor = deductibleFactor;
    premium.building_subtotal = Math.round((premium.building_basic + premium.building_additional) * deductibleFactor);
    premium.contents_subtotal = Math.round((premium.contents_basic + premium.contents_additional) * deductibleFactor);
    premium.combined_subtotal = premium.building_subtotal + premium.contents_subtotal;
    subtotal = premium.combined_subtotal;

    // 3. add ICC premium
    premium.icc_premium = iccPremium;

    subtotal += premium.icc_premium;

    // 4. add CRS discount
    premium.crs_discount = Math.round(subtotal * getCrsDiscount(crs_rating));

    subtotal -= premium.crs_discount;

    // 5. add reserve fund assessment
    premium.reserve_fund_assessment = Math.round(subtotal * 0.15);

    subtotal += premium.reserve_fund_assessment;

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
    if (/^PRP/.test(rates.table) || !building_coverage) {
      premium.federal_policy_fee = 25;
    }
    else {
      premium.federal_policy_fee = 50;
    }

    premium.combined_total = subtotal +
      premium.hfiaa_surcharge +
      premium.probation_surcharge +
      premium.federal_policy_fee;

    return premium;
  }

  getIccPremium (params, rateTable) {
    const {
      firm_zone,
      construction_date,
      occupancy_type,
      building_type,
      building_coverage,
      elevation_above_bfe,
      certification
    } = params;

    if (!building_coverage) return 0;

    const is_elevated = isElevated(params);

    const rate = this.table.icc.find(rate => {
      const buildingTypeRegex = new RegExp(rate.building_type);
      const checks = [
        (parseRateTable(rate.rate_table).includes(rateTable)),
        (rate.is_elevated === null || (rate.is_elevated === is_elevated)),
        (parseZone(rate.firm_zone).includes(firm_zone)),
        (!rate.construction_date || (rate.construction_date === construction_date)),
        (!rate.building_type || buildingTypeRegex.test(building_type)),
        (this.compareRule(rate.elevation_above_bfe, elevation_above_bfe)),
        (!rate.certification || (rate.certification === certification)),
        (this.compareRule(rate.building_coverage, building_coverage))
      ]
      return checks.every(r => r);
    });

    if (!rate) return 0;

    return rate.icc_premium;
  }

  getPolicy (params, buildingCoverage) {
    const {
      firm_zone,
      construction_date,
      program_type,
    } = params;

    return this.table.policies.find(policy => {
      return (!policy.firm_zone || parseZone(policy.firm_zone).includes(firm_zone)) &&
        (!policy.construction_date || (policy.construction_date === construction_date)) &&
        (policy.program_type === program_type) &&
        this.compareRule(policy.building_coverage, buildingCoverage);
    });
  }
  
  getLimits (params) {
    const { occupancy_type, program_type } = params;

    return this.table.limits.find(limit => {
      return limit.occupancy_type === occupancy_type && limit.program_type === program_type;
    });
  }

  getDeductibleFactor (deductibles, policy) {
    if (policy.policy_type === 'subsidized') {
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
        (!contents_deductible || (row.contents_deductible === contents_deductible)) &&
        (!building_deductible || (row.building_deductible === building_deductible));
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

    // use post-firm full-risk when a pre-firm building has elevation data
    if (Number.isInteger(elevation_above_bfe) && params.construction_date === 'pre_firm') {
      params.construction_date = 'post_firm';
    }

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
      rate_table: lookupTable,
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
      const buildingTypeRegex = new RegExp('^' + row.building_type);
      return (row.program_type === program_type) &&
        ((row.construction_date === construction_date) || !row.construction_date) &&
        (buildingTypeRegex.test(building_type) || !row.building_type) &&
        ((row.residence_type === residence_type) || !row.residence_type) &&
        ((row.srl_property === srl_property) || row.srl_property === null) &&
        ((row.substantially_improved === substantially_improved) || row.substantially_improved === null) &&
        (!row.firm_zone.length || (parseZone(row.firm_zone).includes(firm_zone)));
    });

    return found.firm_table;
  }
}

module.exports = RateTable;
