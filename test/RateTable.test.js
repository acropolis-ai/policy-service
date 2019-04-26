const assert = require('assert');
const RateTable = require('../RateTable');

describe('RateTable', () => {
  let rateTable = new RateTable(require('../rate-table'));

  describe('findLookupTable', () => {
    it('should determine correct lookup table for basic query current', () => {
      const lt = rateTable.getLookupTable({
        construction_date: 'pre_firm',
        residence_type: 'primary_residence',
        srl_property: false,
        substantially_improved: false,
        program_type: 'regular_program',
        date: new Date('1/1/2019')
      });

      assert(lt === '2A');
    });

    // rate examples from
    // https://www.fema.gov/media-library-data/1541619486310-878aa52bac8ac0a6baabe8ac90c92719/3_how_to_write_508_oct2018.pdf
  });
  describe('getRates', () => {
    it.skip('2019 Provisional Rate Example 1', () => {
      const rate = rateTable.getRates({
        firm_zone: 'AE',
        construction_date: 'post_firm',
        program_type: 'regular_program',
        occupancy_type: 'residential_single_family',
        floors: 3,
        building_type: 'with_basement',
        srl_property: false,
        substantially_improved: false,
        contents_location: 'basement_and_above',
        date: new Date('1/1/2019')
      });

      //console.log(rate);

      assert(rate.building_basic === 3.00);
      assert(rate.building_additional === 2.00);
      assert(rate.contents_basic === 3.00);
      assert(rate.contents_additional === 2.00);
    });
    it('2019 Rate Example 1', () => {
      const rate = rateTable.getRates({
        construction_date: 'pre_firm',
        program_type: 'emergency_program',
        occupancy_type: 'residential_single_family',
        floors: 1,
        building_type: 'no_basement_enclosure',
        srl_property: false,
        substantially_improved: false,
        contents_location: 'lowest_floor_only',
        date: new Date('1/1/2019')
      });

      //console.log(rate);

      assert(rate.building_basic === 1.04);
      assert(rate.building_additional === 1.04);
      assert(rate.contents_basic === 1.31);
      assert(rate.contents_additional === 1.31);
    });
    it('2019 Rate Example 2', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: false,
        substantially_improved: false,
        construction_date: 'pre_firm',
        firm_zone: 'B',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === 1.09);
      assert(rate.building_additional === 0.30);
      assert(rate.contents_basic === 1.67);
      assert(rate.contents_additional === 0.53);
    });
    it('2019 Rate Example 3', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: false,
        substantially_improved: false,
        construction_date: 'pre_firm',
        firm_zone: 'AE',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'with_enclosure',
        contents_location: 'enclosure_and_above',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === 1.11);
      assert(rate.building_additional === 1.68);
      assert(rate.contents_basic === 1.31);
      assert(rate.contents_additional === 1.71);
    });
    it('2019 Rate Example 4', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'non_primary_residence',
        srl_property: false,
        substantially_improved: false,
        construction_date: 'pre_firm',
        firm_zone: 'A15',
        occupancy_type: 'residential_single_family',
        floors: 3,
        building_type: 'with_basement',
        contents_location: 'basement_and_above',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === 2.71);
      assert(rate.building_additional === 3.23);
      assert(rate.contents_basic === 3.20);
      assert(rate.contents_additional === 3.29);
    });
    it('2019 Rate Example 5', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: true,
        substantially_improved: false,
        construction_date: 'pre_firm',
        firm_zone: 'AE',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === 2.01);
      assert(rate.building_additional === 2.05);
      assert(rate.contents_basic === 2.56);
      assert(rate.contents_additional === 3.68);
    });
    it('2019 Rate Example 6', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: false,
        substantially_improved: true,
        construction_date: 'pre_firm',
        firm_zone: 'AE',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === 1.89);
      assert(rate.building_additional === 1.74);
      assert(rate.contents_basic === 2.37);
      assert(rate.contents_additional === 3.11);
    });
    it('2019 Rate Example 7', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: false,
        construction_date: 'pre_firm',
        firm_zone: 'AE',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 1,
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === .71);
      assert(rate.building_additional === .08);
      assert(rate.contents_basic === 0.38);
      assert(rate.contents_additional === 0.12);
    });
    it('2019 Rate Example 8', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        srl_property: false,
        construction_date: 'post_firm',
        firm_zone: 'AE',
        occupancy_type: 'non_residential_business',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 4,
        contents_location: 'full_floor_above_ground',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === .21);
      assert(rate.building_additional === .08);
      assert(rate.contents_basic === 0.22);
      assert(rate.contents_additional === 0.12);
    });
    it('2019 Rate Example 9', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'non_primary_residence',
        //srl_property: false,
        construction_date: 'post_firm_75_81',
        firm_zone: 'V13',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 1,
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === 4.84);
      assert(rate.building_additional === 1.04);
      assert(rate.contents_basic === 3.86);
      assert(rate.contents_additional === 1.89);
    });
    it('2019 Rate Example 10', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        //srl_property: false,
        construction_date: 'post_1981',
        firm_zone: 'VE',
        occupancy_type: 'residential_single_family',
        floors: 3,
        building_type: 'with_enclosure',
        elevation_above_bfe: -1,
        replacement_cost_ratio: '>75%',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === 4.61);
      assert(rate.building_additional === 4.61);
      assert(rate.contents_basic === 3.30);
      assert(rate.contents_additional === 3.30);
    });
    it('(Contents Only) 2019 Rate Example 11', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        //srl_property: false,
        construction_date: 'post_firm',
        firm_zone: 'A17',
        occupancy_type: 'residential_multi_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 2,
        contents_location: 'full_floor_above_ground',
        date: new Date('1/1/2019')
      });

      //assert(rate.building_basic === 4.61);
      //assert(rate.building_additional === 4.61);
      assert(rate.contents_basic === 0.35);
      assert(rate.contents_additional === 0.12);
    });
    it('2019 Rate Example 12', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        construction_date: 'post_firm',
        firm_zone: 'AO',
        occupancy_type: 'non_residential_other',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: -1,
        certification: 'none',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === 1.56);
      assert(rate.building_additional === 0.26);
      assert(rate.contents_basic === 1.20);
      assert(rate.contents_additional === 0.16);
    });
    it('2019 Rate Example 13', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        //srl_property: false,
        construction_date: 'post_firm',
        firm_zone: 'AO',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 1,
        certification: 'elevation_or_compliance',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === 0.28);
      assert(rate.building_additional === 0.08);
      assert(rate.contents_basic === 0.38);
      assert(rate.contents_additional === 0.13);
    });
    it('2019 Rate Example 14', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        construction_date: 'post_firm',
        firm_zone: 'AH',
        occupancy_type: 'residential_single_family',
        floors: 1,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: -1,
        certification: 'none',
        contents_location: 'lowest_floor_only',
        date: new Date('1/1/2019')
      });

      //console.log(rate);

      assert(rate.building_basic === 1.71);
      assert(rate.building_additional === 0.20);
      assert(rate.contents_basic === 0.84);
      assert(rate.contents_additional === 0.15);
    });
    it('2019 Rate Example 15', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        //residence_type: 'primary_residence',
        construction_date: 'post_firm',
        firm_zone: 'AH',
        occupancy_type: 'residential_multi_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 3,
        certification: 'elevation_or_compliance',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === 0.28);
      assert(rate.building_additional === 0.08);
      assert(rate.contents_basic === 0.38);
      assert(rate.contents_additional === 0.13);
    });
    it('2019 Rate Example 16', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        construction_date: 'post_firm',
        firm_zone: 'A',
        occupancy_type: 'residential_multi_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 6,
        certification: 'elevation_with_bfe',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      //console.log(rate);

      assert(rate.building_basic === 0.52);
      assert(rate.building_additional === 0.09);
      assert(rate.contents_basic === 0.29);
      assert(rate.contents_additional === 0.09);
    });
    it('2019 Rate Example 17', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        construction_date: 'post_firm',
        residence_type: 'primary_residence',
        firm_zone: 'A',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 5,
        certification: 'elevation_without_bfe',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(rate.building_basic === 0.53);
      assert(rate.building_additional === 0.11);
      assert(rate.contents_basic === 0.30);
      assert(rate.contents_additional === 0.09);
    });
    it.skip('PRP Rating Example Table 3A', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        construction_date: 'post_firm',
        residence_type: 'primary_residence',
        firm_zone: 'X',
        no_disaster_benefits: true,
        no_multiple_claims: true,
        occupancy_type: 'residential_single_family',
        floors: 2,
        date: new Date('1/1/2019')
      });


    });
    it.skip('Newly Mapped Rating Example Table 3', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        construction_date: 'post_firm',
        residence_type: 'primary_residence',
        firm_zone: 'X',
        occupancy_type: 'residential_single_family',
        floors: 2,
        date: new Date('1/1/2019')
      });

    });
  });

  describe('getPremium', () => {
    it.only('2019 Rate Example 1', () => {
      const premium = rateTable.getPremium({
        building_coverage: 35000,
        contents_coverage: 10000,
        building_deductible: 1500,
        contents_deductible: 1500,
        construction_date: 'pre_firm',
        residence_type: 'primary_residence',
        program_type: 'emergency_program',
        occupancy_type: 'residential_single_family',
        floors: 1,
        building_type: 'no_basement_enclosure',
        srl_property: false,
        substantially_improved: false,
        contents_location: 'lowest_floor_only',
        date: new Date('1/1/2019')
      });

      assert(premium.building_subtotal === 382);
      assert(premium.contents_subtotal === 138);
      assert(premium.combined_subtotal === 520);
      assert(premium.icc_premium === 0);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 78);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 673);
    });

  });
});
