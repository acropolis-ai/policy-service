class RateTable {

  static compareRule (rule, value) {
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

  static isElevated (params) {
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
  static parseZone (zone) {
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

  static parseRateTable (table) {
    if (!table) return [ ];

    return table.split(',');
  }

  static getCrsDiscount (crsRating) {
    if (!crsRating) return 0;
    return (10 - crsRating) * .05;
  }

  static setRatingType (params) {
    if (params.rating_type) return;

    const preFirm74 = Date.parse('1/1/1975');
    const postFirm81 = Date.parse('10/1/1981')
    const constructionDate = Date.parse(params.rating_type);
    const isPostFirm81Zone = RateTable.parseZone('V,VE,V1-V99').includes(params.firm_zone);
    const isPrpZone = RateTable.parseZone('B,C,X,AR,A99').includes(params.firm_zone);
    const hasElevationData = Number.isFinite(params.elevation_above_bfe);

    if (constructionDate < preFirm74) {
      params.rating_type = 'pre_firm';
    }
    else if (constructionDate < postFirm81 && constructionDate >= preFirm74) {
      params.rating_type = 'post_firm_75_81';
    }
    else if (constructionDate >= postFirm81 && isPostFirm81Zone) {
      params.rating_type = 'post_1981'
    }
    else {
      params.rating_type = params.rating_type;
    }

    // determine optional post-firm eligibility
    if (params.rating_type === 'pre_firm' &&
        Number.isInteger(params.elevation_above_bfe) &&
        /^AR/.test(params.firm_zone)) {
      params.optional_post_firm = true;
    }

    // determine PRP eligibility
    if (params.request_prp && isPrpZone &&
        params.program_type === 'regular_program' &&
        params.occupancy_type === 'residential_single_family') {
      params.prp_eligible = true;
    }

    // TODO determine newly mapped eligibility

  }

  constructor (rateTable) {
    this.table = rateTable;
  }

  getPremium (params) {
    const {
      building_deductible,
      contents_deductible,
      building_coverage,
      contents_coverage,
      crs_rating
    } = params;

    let subtotal = 0;
    const rates = this.getRates(params);
    const premium = {
      rate_table: rates.rate_table,
      params
    };

    if (rates.base_premium) {
      premium.combined_subtotal = subtotal = rates.base_premium;
    }
    else {
      const limits = this.getLimits(params);
      const policy = this.getPolicy(params, building_coverage);
      const deductibles = this.getDeductibles(params);
      const deductibleFactor = this.getDeductibleFactor(deductibles, policy);

      // 1. get base premium - multiply coverage with determined rate
      const building_basic = Math.min(limits.building_basic, building_coverage);
      const building_additional = building_coverage - limits.building_basic;
      const contents_basic = Math.min(limits.contents_basic, contents_coverage);
      const contents_additional = contents_coverage - limits.contents_basic;
      premium.building_basic_coverage = building_basic;
      premium.building_additional_coverage = building_additional;
      premium.contents_basic_coverage = contents_basic;
      premium.contents_additional_coverage = contents_additional;
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
    }
    
    subtotal = this.applyPremiumSurcharges(params, rates, premium, subtotal);

    premium.combined_total = subtotal +
      premium.hfiaa_surcharge +
      premium.probation_surcharge +
      premium.federal_policy_fee;

    premium.rates = rates;

    const alternatePremium = this.getAlternatePremium(params);

    if (!alternatePremium || alternatePremium.combined_total > premium.combined_total) {
      return premium;
    }
    else {
      return alternatePremium;
    }
  }

  applyPremiumSurcharges (params, rates, premium, subtotal) {
    const iccPremium = this.getIccPremium(params, rates.rate_table);

    // 3. add ICC premium
    premium.icc_premium = iccPremium;

    subtotal += premium.icc_premium;

    // 4. add CRS discount
    premium.crs_discount = Math.round(subtotal * RateTable.getCrsDiscount(params.crs_rating));

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
    if (/^PRP/.test(rates.rate_table) || !params.building_coverage) {
      premium.federal_policy_fee = 25;
    }
    else {
      premium.federal_policy_fee = 50;
    }
    
    return subtotal;
  }

  getAlternatePremium (params) {
    if (params.rating_type !== 'prp' && params.prp_eligible) {
      return this.getPremium({ ...params, rating_type: 'prp' });
    }
    else if (params.rating_type !== 'post_firm' && params.optional_post_firm) {
      return this.getPremium({ ...params, rating_type: 'post_firm' });
    }
    else {
      return null
    }
  }

  getIccPremium (params, rateTable) {
    const {
      firm_zone,
      rating_type,
      occupancy_type,
      building_type,
      building_coverage,
      elevation_above_bfe,
      certification
    } = params;

    if (!building_coverage) return 0;

    // TODO move to spreadsheet
    /*
    if (/^PRP/.test(rateTable)) {
      if (/^residential/.test(occupancy_type)) {
        if (building_coverage <= 230000) {
          return 5;
        }
        else {
          return 4;
        }
      }
      else {
        if (building_coverage <= 480000) {
          return 5;
        }
        else {
          return 4;
        }
      }
    }
    */

    const is_elevated = RateTable.isElevated(params);

    const rate = this.table.icc.find(rate => {
      const buildingTypeRegex = new RegExp(rate.building_type);
      const checks = [
        (RateTable.parseRateTable(rate.rate_table).includes(rateTable)),
        (!rate.occupancy_type || (rate.occupancy_type === occupancy_type)),
        (rate.is_elevated === null || (rate.is_elevated === is_elevated)),
        (!rate.firm_zone || RateTable.parseZone(rate.firm_zone).includes(firm_zone)),
        (!rate.rating_type || (rate.rating_type === rating_type)),
        (!rate.building_type || buildingTypeRegex.test(building_type)),
        (RateTable.compareRule(rate.elevation_above_bfe, elevation_above_bfe)),
        (!rate.certification || (rate.certification === certification)),
        (RateTable.compareRule(rate.building_coverage, building_coverage))
      ]
      return checks.every(r => r);
    });

    if (!rate) return 0;

    return rate.icc_premium;
  }

  getPolicy (params, buildingCoverage) {
    const {
      firm_zone,
      rating_type,
      program_type,
    } = params;

    return this.table.policies.find(policy => {
      return (!policy.firm_zone || RateTable.parseZone(policy.firm_zone).includes(firm_zone)) &&
        (!policy.rating_type || (policy.rating_type === rating_type)) &&
        (policy.program_type === program_type) &&
        RateTable.compareRule(policy.building_coverage, buildingCoverage);
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

  getPrpRates (params, lookupTable) {
    const {
      occupancy_type,
      building_type,
      contents_location,
      building_coverage,
      contents_coverage
    } = params;

    //console.log('rate table', this.table.rates[lookupTable]);
    //console.log('lookupTable', lookupTable);

    const result = this.table.rates[lookupTable]
      .find(rate => {
        return (!rate.occupancy_type || (rate.occupancy_type === occupancy_type)) &&
          (!rate.building_type || (rate.building_type === building_type)) &&
          (!rate.contents_location || (rate.contents_location === contents_location)) &&
          (!rate.building_coverage || (rate.building_coverage === building_coverage)) &&
          (!rate.contents_coverage || (rate.contents_coverage === contents_coverage));
      });

    return {
      rate_table: lookupTable,
      base_premium: result.base_premium
    };
  }

  getReplacementCostRatio (params) {
    if (params.replacement_cost_ratio) return params.replacement_cost_ratio;

    if (params.replacement_cost) {
      let ratio = params.building_coverage / params.replacement_cost;
      if (ratio < 0.50) {
        return '<50%';
      }
      else if (ratio >= 0.50 && ratio < 0.75) {
        return '50-74%';
      }
      else {
        return '>75%';
      }
    }

    return null;
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
      floors,
      contents_location
    } = params;

    params.replacement_cost_ratio = this.getReplacementCostRatio(params);

    if (/^PRP/.test(lookupTable)) {
      return this.getPrpRates(params, lookupTable);
    }

    const building = this.table.rates[lookupTable]
      .find(rate => {
        return [
          rate.building_basic && rate.building_additional,
          !rate.building_type || (rate.building_type === building_type),
          !rate.occupancy_type || (rate.occupancy_type === occupancy_type),
          !rate.certification || (rate.certification === certification),
          !rate.replacement_cost_ratio || (rate.replacement_cost_ratio === params.replacement_cost_ratio),
          RateTable.compareRule(rate.elevation_above_bfe, elevation_above_bfe),
          RateTable.compareRule(rate.floors, floors),
          !rate.firm_zone || (RateTable.parseZone(rate.firm_zone).includes(firm_zone))
        ].every(r => r);
      });

    const contents = this.table.rates[lookupTable]
      .find(rate => {
        return (rate.contents_basic && rate.contents_additional) &&
          (!rate.building_type || (rate.building_type === building_type)) &&
          (!rate.occupancy_type || (rate.occupancy_type === occupancy_type)) &&
          (!rate.contents_location || (rate.contents_location === contents_location)) &&
          (!rate.certification || (rate.certification === certification)) &&
          (RateTable.compareRule(rate.floors, floors)) &&
          (RateTable.compareRule(rate.elevation_above_bfe, elevation_above_bfe)) &&
          (!rate.firm_zone || (RateTable.parseZone(rate.firm_zone).includes(firm_zone)));
      }) || { };

    return {
      rate_table: lookupTable,
      building_basic: building.building_basic,
      building_additional: building.building_additional,
      contents_basic: contents.contents_basic,
      contents_additional: contents.contents_additional
    };
  }

  getLookupTable (params) {
    RateTable.setRatingType(params);

    const {
      firm_zone,
      rating_type,
      residence_type,
      srl_property,
      substantially_improved,
      program_type,
      elevation_above_bfe,
      building_type,
      request_prp
    } = params;

    const found = this.table.lookupTable.find(row => {
      const buildingTypeRegex = new RegExp('^' + row.building_type);
      return (row.program_type === program_type) &&
        ((row.rating_type === rating_type) || !row.rating_type) &&
        (buildingTypeRegex.test(building_type) || !row.building_type) &&
        ((row.residence_type === residence_type) || !row.residence_type) &&
        ((row.srl_property === srl_property) || row.srl_property === null) &&
        ((row.substantially_improved === substantially_improved) || row.substantially_improved === null) &&
        (!row.firm_zone || (RateTable.parseZone(row.firm_zone).includes(firm_zone))) &&
        (!request_prp || (row.request_prp === request_prp));
    });

    return found.firm_table;
  }
}

module.exports = RateTable;
