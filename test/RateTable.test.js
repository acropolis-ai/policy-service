const assert = require('assert');
const RateTable = require('../RateTable');

describe('RateTable', () => {
  let rateTable = new RateTable(require('../rate-table'));

  describe('findLookupTable', () => {
    it('should determine correct lookup table for basic query', () => {
      const lt = rateTable.getLookupTable({
        construction_date: 'pre_firm',
        residence_type: 'primary_residence',
        srl_property: false,
        substantially_improved: false,
        program_type: 'regular_program'
      });

      assert(lt === '2A');
    });

    // rate examples from
    // https://www.fema.gov/media-library-data/1541619486310-878aa52bac8ac0a6baabe8ac90c92719/3_how_to_write_508_oct2018.pdf
  });
  describe('getRates', () => {
    it('(Building) Rate Example 1', () => {
      const rate = rateTable.getRates({
        construction_date: 'pre_firm',
        program_type: 'emergency_program',
        occupancy_type: 'residential_single_family',
        floors: 1,
        building_type: 'no_basement_enclosure',
        srl_property: false,
        substantially_improved: false
      });

      assert(rate.building_basic === 1.04);
      assert(rate.building_additional === -1);
    });
    it('(Building) Rate Example 2', () => {
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
      });

      assert(rate.building_basic === 1.09);
      assert(rate.building_additional === 0.30);
    });
    it('(Building) Rate Example 3', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: false,
        substantially_improved: false,
        construction_date: 'pre_firm',
        firm_zone: 'AE',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'with_enclosure'
      });

      assert(rate.building_basic === 1.11);
      assert(rate.building_additional === 1.68);
    });
    it('(Building) Rate Example 4', () => {
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
      });

      assert(rate.building_basic === 2.71);
      assert(rate.building_additional === 3.23);
    });
    it('(Building) Rate Example 5', () => {
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
      });

      assert(rate.building_basic === 2.01);
      assert(rate.building_additional === 2.05);
    });
    it('(Building) Rate Example 6', () => {
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
      });

      assert(rate.building_basic === 1.89);
      assert(rate.building_additional === 1.74);
    });
    it('(Building) Rate Example 7', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: false,
        construction_date: 'pre_firm',
        firm_zone: 'AE',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 1
      });

      assert(rate.building_basic === .71);
      assert(rate.building_additional === .08);
    });
    it('(Building) Rate Example 8', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        srl_property: false,
        construction_date: 'post_firm',
        firm_zone: 'AE',
        occupancy_type: 'non_residential_business',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 4
      });

      assert(rate.building_basic === .21);
      assert(rate.building_additional === .08);
    });
    it('(Building) Rate Example 9', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'non_primary_residence',
        //srl_property: false,
        construction_date: 'post_firm_75_81',
        firm_zone: 'V13',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 1
      });

      assert(rate.building_basic === 4.84);
      assert(rate.building_additional === 1.04);
    });
    it('(Building) Rate Example 10', () => {
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
        replacement_cost_ratio: '>75%'
      });

      assert(rate.building_basic === 4.61);
      assert(rate.building_additional === 4.61);
    });
    it.skip('(Contents Only) Rate Example 11', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        //srl_property: false,
        construction_date: 'post_firm',
        firm_zone: 'A17',
        occupancy_type: 'residential_multi_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 2
      });

      console.log(rate);

      assert(rate.building_basic === 4.61);
      assert(rate.building_additional === 4.61);
    });
    it('(Building) Rate Example 12', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        //srl_property: false,
        construction_date: 'post_firm',
        firm_zone: 'AO',
        occupancy_type: 'non_residential_other',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: -1,
        certification: 'none'
      });

      assert(rate.building_basic === 1.56);
      assert(rate.building_additional === 0.26);
    });
    it('(Building) Rate Example 13', () => {
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
        certification: 'elevation_or_compliance'
      });

      assert(rate.building_basic === 0.28);
      assert(rate.building_additional === 0.08);
    });
    it('(Building) Rate Example 14', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        construction_date: 'post_firm',
        firm_zone: 'AH',
        occupancy_type: 'residential_single_family',
        floors: 1,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: -1,
        certification: 'none'
      });

      assert(rate.building_basic === 1.71);
      assert(rate.building_additional === 0.20);
    });
    it('(Building) Rate Example 15', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        //residence_type: 'primary_residence',
        construction_date: 'post_firm',
        firm_zone: 'AH',
        occupancy_type: 'residential_multi_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 3,
        certification: 'elevation_or_compliance'
      });

      assert(rate.building_basic === 0.28);
      assert(rate.building_additional === 0.08);
    });
    it('(Building) Rate Example 16', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        construction_date: 'post_firm',
        firm_zone: 'A',
        occupancy_type: 'residential_multi_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 6,
        certification: 'elevation_with_bfe'
      });

      assert(rate.building_basic === 0.52);
      assert(rate.building_additional === 0.09);
    });
    it('(Building) Rate Example 17', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        construction_date: 'post_firm',
        residence_type: 'primary_residence',
        firm_zone: 'A',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 5,
        certification: 'elevation_without_bfe'
      });

      assert(rate.building_basic === 0.53);
      assert(rate.building_additional === 0.11);
    });
    it.skip('(Building) PRP Rating Example Table 3A', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        construction_date: 'post_firm',
        residence_type: 'primary_residence',
        firm_zone: 'X',
        occupancy_type: 'residential_single_family',
        floors: 2,
      });

      assert(rate.building_basic === 0.53);
      assert(rate.building_additional === 0.11);
    });
    it.skip('(Building) Newly Mapped Rating Example Table 3', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        construction_date: 'post_firm',
        residence_type: 'primary_residence',
        firm_zone: 'X',
        occupancy_type: 'residential_single_family',
        floors: 2,
      });

      assert(rate.building_basic === 0.53);
      assert(rate.building_additional === 0.11);
    });
  });
});
