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
    const request = {
      building_deductible,
      contents_deductible,
      building_coverage,
      contents_coverage
    };
    const premium = { };

    // 1. get base premium
    const rates = this.getRates(params);
    const limits = this.getLimits(params);
    const deductibles = this.getDeductibles(params);

    //premium.building_basic = rates.building_basic * 
    premium.building_additional = rates.building_additional * building_coverage;

    // 2. apply deductible factor





  }
  
  getLimits (params) {
    const { occupancy, program_type } = params;

    return this.table.limits.find(limit => {

    });

  }

  getDeductibles (params) {

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
          !rate.firm_zone.length || (rate.firm_zone.includes(firm_zone)),
          !rate.building_type || (rate.building_type === building_type),
          !rate.occupancy_type || (rate.occupancy_type === occupancy_type),
          !rate.certification || (rate.certification === certification),
          this.compareRule(rate.elevation_above_bfe, elevation_above_bfe),
          this.compareRule(rate.floors, floors),
          rate.replacement_cost_ratio === replacement_cost_ratio || !rate.replacement_cost_ratio
        ].every(r => r);
      });

    const contents = this.table.rates[lookupTable]
      .filter(({ rate_table }) => rate_table === lookupTable)
      .find(rate => {
        return [
          !!rate.contents_basic && !!rate.contents_additional,
          !rate.firm_zone.length || (rate.firm_zone.includes(firm_zone)),
          !rate.building_type || (rate.building_type === building_type),
          !rate.occupancy_type || (rate.occupancy_type === occupancy_type),
          !rate.contents_location || (rate.contents_location === contents_location),
          this.compareRule(rate.floors, floors),
          this.compareRule(rate.elevation_above_bfe, elevation_above_bfe),
          !rate.certification || (rate.certification === certification)
        ].every(r => r);
      }) || { };

    return {
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

    //console.log('hasElevationData', hasElevationData);
    const found = this.table.lookupTable.filter(row => {
      return [
        !row.firm_zone.length || (row.firm_zone.includes(firm_zone)),
        (row.program_type === program_type),
        //(row.firm_zone === firm_zone) || !row.firm_zone,
        (row.construction_date === construction_date) || !row.construction_date,
        (row.building_type === building_type) || !row.building_type,
        (row.residence_type === residence_type) || !row.residence_type,
        (row.srl_property === srl_property) || row.srl_property === null,
        (row.substantially_improved === substantially_improved) || row.substantially_improved === null
      ].every(r => r);
    });

    //console.log('firm_table', found[0].firm_table);

    return found[0].firm_table;
  }
}

module.exports = RateTable;
