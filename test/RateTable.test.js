const assert = require('assert');
const RateTable = require('../RateTable');

describe('RateTable', () => {
  let rateTable = new RateTable(require('../rate-table'));

  describe('findLookupTable', () => {
    it('should determine correct lookup table for basic query current', () => {
      const lt = rateTable.getLookupTable({
        rating_type: 'pre_firm',
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
        rating_type: 'post_firm',
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
        rating_type: 'pre_firm',
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
        rating_type: 'pre_firm',
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
        rating_type: 'pre_firm',
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
        rating_type: 'pre_firm',
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
        rating_type: 'pre_firm',
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
        rating_type: 'pre_firm',
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
        rating_type: 'post_firm', // optional post-firm
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
        rating_type: 'post_firm',
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
        rating_type: 'post_firm_75_81',
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
        rating_type: 'post_1981',
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
        rating_type: 'post_firm',
        firm_zone: 'A17',
        occupancy_type: 'residential_multi_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 2,
        contents_location: 'full_floor_above_ground',
        date: new Date('1/1/2019')
      });

      assert(rate.contents_basic === 0.35);
      assert(rate.contents_additional === 0.12);
    });
    it('2019 Rate Example 12', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        rating_type: 'post_firm',
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
        rating_type: 'post_firm',
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
        rating_type: 'post_firm',
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
        rating_type: 'post_firm',
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
        rating_type: 'post_firm',
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
        rating_type: 'post_firm',
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
    it.skip('Newly Mapped Rating Example Table 3', () => {
      const rate = rateTable.getRates({
        program_type: 'regular_program',
        rating_type: 'post_firm',
        residence_type: 'primary_residence',
        firm_zone: 'X',
        occupancy_type: 'residential_single_family',
        floors: 2,
        date: new Date('1/1/2019')
      });

    });
  });

  describe('getPremium', () => {
    it('2019 Rate Example 1', () => {
      const premium = rateTable.getPremium({
        building_coverage: 35000,
        contents_coverage: 10000,
        building_deductible: 1500,
        contents_deductible: 1500,
        rating_type: 'pre_firm',
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
    it('2019 Rate Example 2', () => {
      const premium = rateTable.getPremium({
        building_coverage: 150000,
        contents_coverage: 60000,
        building_deductible: 1250,
        contents_deductible: 1250,
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: false,
        substantially_improved: false,
        rating_type: 'pre_firm',
        firm_zone: 'B',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(premium.building_subtotal === 906);
      assert(premium.contents_subtotal === 592);
      assert(premium.combined_subtotal === 1498);
      assert(premium.icc_premium === 6);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 226);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 1805);
    });
    it('2019 Rate Example 3', () => {
      const premium = rateTable.getPremium({
        building_coverage: 200000,
        contents_coverage: 75000,
        building_deductible: 2000,
        contents_deductible: 2000,
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: false,
        substantially_improved: false,
        rating_type: 'pre_firm',
        firm_zone: 'AE',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'with_enclosure',
        contents_location: 'enclosure_and_above',
        date: new Date('1/1/2019')
      });

      assert(premium.building_subtotal === 3018);
      assert(premium.contents_subtotal === 1183);
      assert(premium.combined_subtotal === 4201);
      assert(premium.icc_premium === 75);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 641);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 4992);
    });
    it('2019 Rate Example 4', () => {
      const premium = rateTable.getPremium({
        building_coverage: 250000,
        contents_coverage: 100000,
        building_deductible: 3000,
        contents_deductible: 2000,
        program_type: 'regular_program',
        residence_type: 'non_primary_residence',
        srl_property: false,
        substantially_improved: false,
        rating_type: 'pre_firm',
        firm_zone: 'A15',
        crs_rating: 4,
        occupancy_type: 'residential_single_family',
        floors: 3,
        building_type: 'with_basement',
        contents_location: 'basement_and_above',
        date: new Date('1/1/2019')
      });

      //console.log(premium);

      assert(premium.building_subtotal === 7569);
      assert(premium.contents_subtotal === 3186);
      assert(premium.combined_subtotal === 10755);
      assert(premium.icc_premium === 65);
      assert(premium.crs_discount === 3246);
      assert(premium.reserve_fund_assessment === 1136);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 250);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 9010);
    });
    it('2019 Rate Example 5', () => {
      const premium = rateTable.getPremium({
        building_coverage: 200000,
        contents_coverage: 40000,
        building_deductible: 2000,
        contents_deductible: 2000,
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: true,
        substantially_improved: false,
        rating_type: 'pre_firm',
        firm_zone: 'AE',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(premium.building_subtotal === 4076);
      assert(premium.contents_subtotal === 1192);
      assert(premium.combined_subtotal === 5268);
      assert(premium.icc_premium === 75);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 801);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 6219);
    });
    it('2019 Rate Example 6', () => {
      const premium = rateTable.getPremium({
        building_coverage: 250000,
        contents_coverage: 100000,
        building_deductible: 2000,
        contents_deductible: 2000,
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: false,
        substantially_improved: true,
        rating_type: 'pre_firm',
        firm_zone: 'AE',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(premium.building_subtotal === 4440);
      assert(premium.contents_subtotal === 2926);
      assert(premium.combined_subtotal === 7366);
      assert(premium.icc_premium === 65);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 1115);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 8621);
    });
    it('2019 Rate Example 7', () => {
      const premium = rateTable.getPremium({
        building_coverage: 150000,
        contents_coverage: 50000,
        building_deductible: 1500,
        contents_deductible: 1500,
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        srl_property: false,
        rating_type: 'post_firm',
        firm_zone: 'AE',
        crs_rating: 8,
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 1,
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(premium.building_subtotal === 481);
      assert(premium.contents_subtotal === 121);
      assert(premium.combined_subtotal === 602);
      assert(premium.icc_premium === 6);
      assert(premium.crs_discount === 61);
      assert(premium.reserve_fund_assessment === 82);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 704);
    });
    it('2019 Rate Example 8', () => {
      const premium = rateTable.getPremium({
        building_coverage: 500000,
        contents_coverage: 500000,
        building_deductible: 5000,
        contents_deductible: 5000,
        program_type: 'regular_program',
        srl_property: false,
        rating_type: 'post_firm',
        firm_zone: 'AE',
        crs_rating: 5,
        occupancy_type: 'non_residential_business',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 4,
        contents_location: 'full_floor_above_ground',
        date: new Date('1/1/2019')
      });

      assert(premium.building_subtotal === 559);
      assert(premium.contents_subtotal === 668);
      assert(premium.combined_subtotal === 1227);
      assert(premium.icc_premium === 5);
      assert(premium.crs_discount === 308);
      assert(premium.reserve_fund_assessment === 139);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 250);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 1363);
    });
    it('2019 Rate Example 9', () => {
      const premium = rateTable.getPremium({
        building_coverage: 150000,
        contents_coverage: 100000,
        building_deductible: 2000,
        contents_deductible: 2000,
        program_type: 'regular_program',
        residence_type: 'non_primary_residence',
        rating_type: 'post_firm_75_81',
        firm_zone: 'V13',
        crs_rating: 8,
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 1,
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      //console.log(premium);

      assert(premium.building_subtotal === 3552);
      assert(premium.contents_subtotal === 2204);
      assert(premium.combined_subtotal === 5756);
      assert(premium.icc_premium === 33);
      assert(premium.crs_discount === 579);
      assert(premium.reserve_fund_assessment === 782);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 250);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 6292);
    });
    it('2019 Rate Example 10', () => {
      const premium = rateTable.getPremium({
        building_coverage: 250000,
        contents_coverage: 100000,
        building_deductible: 3000,
        contents_deductible: 3000,
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        rating_type: 'post_1981',
        firm_zone: 'VE',
        crs_rating: 9,
        occupancy_type: 'residential_single_family',
        floors: 3,
        building_type: 'with_enclosure_lt_300sqft',
        elevation_above_bfe: -1,
        replacement_cost_ratio: '>75%',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      //console.log(premium);

      assert(premium.building_subtotal === 9796);
      assert(premium.contents_subtotal === 2805);
      assert(premium.combined_subtotal === 12601);
      assert(premium.icc_premium === 15);
      assert(premium.crs_discount === 631);
      assert(premium.reserve_fund_assessment === 1798);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 13858);
    });
    it('(Contents Only) 2019 Rate Example 11', () => {
      const premium = rateTable.getPremium({
        building_coverage: 0,
        contents_coverage: 100000,
        building_deductible: 0,
        contents_deductible: 1000,
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        rating_type: 'post_firm',
        firm_zone: 'A17',
        occupancy_type: 'residential_multi_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 2,
        contents_location: 'full_floor_above_ground',
        date: new Date('1/1/2019')
      });

      //console.log(premium);

      assert(premium.building_subtotal === 0);
      assert(premium.contents_subtotal === 178);
      assert(premium.combined_subtotal === 178);
      assert(premium.icc_premium === 0);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 27);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 25);
      assert(premium.combined_total === 255);
    });
    it('2019 Rate Example 12', () => {
      const premium = rateTable.getPremium({
        building_coverage: 500000,
        contents_coverage: 500000,
        building_deductible: 5000,
        contents_deductible: 5000,
        program_type: 'regular_program',
        rating_type: 'post_firm',
        firm_zone: 'AO',
        occupancy_type: 'non_residential_other',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: -1,
        certification: 'none',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      //console.log(premium);

      assert(premium.building_subtotal === 3182);
      assert(premium.contents_subtotal === 2100);
      assert(premium.combined_subtotal === 5282);
      assert(premium.icc_premium === 5);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 793);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 250);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 6380);
    });
    it('2019 Rate Example 13', () => {
      const premium = rateTable.getPremium({
        building_coverage: 250000,
        contents_coverage: 100000,
        building_deductible: 1250,
        contents_deductible: 1250,
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        rating_type: 'post_firm',
        firm_zone: 'AO',
        occupancy_type: 'residential_single_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 1,
        certification: 'elevation_or_compliance',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      assert(premium.building_subtotal === 314);
      assert(premium.contents_subtotal === 189);
      assert(premium.combined_subtotal === 503);
      assert(premium.icc_premium === 5);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 76);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 659);
    });
    it('2019 Rate Example 14', () => {
      const premium = rateTable.getPremium({
        building_coverage: 250000,
        contents_coverage: 25000,
        building_deductible: 3000,
        contents_deductible: 2000,
        program_type: 'regular_program',
        residence_type: 'primary_residence',
        rating_type: 'post_firm',
        firm_zone: 'AH',
        occupancy_type: 'residential_single_family',
        floors: 1,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: -1,
        certification: 'none',
        contents_location: 'lowest_floor_only',
        date: new Date('1/1/2019')
      });

      //console.log(premium);

      assert(premium.building_subtotal === 1265);
      assert(premium.contents_subtotal === 189);
      assert(premium.combined_subtotal === 1454);
      assert(premium.icc_premium === 5);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 219);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 1753);
    });
    it('2019 Rate Example 15', () => {
      const premium = rateTable.getPremium({
        building_coverage: 200000,
        contents_coverage: 40000,
        building_deductible: 1250,
        contents_deductible: 1250,
        program_type: 'regular_program',
        rating_type: 'post_firm',
        firm_zone: 'AH',
        occupancy_type: 'residential_multi_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 3,
        certification: 'elevation_or_compliance',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      //console.log(premium);

      assert(premium.building_subtotal === 274);
      assert(premium.contents_subtotal === 113);
      assert(premium.combined_subtotal === 387);
      assert(premium.icc_premium === 6);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 59);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 250);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 752);
    });
    it('2019 Rate Example 16', () => {
      const premium = rateTable.getPremium({
        building_coverage: 140000,
        contents_coverage: 70000,
        building_deductible: 1250,
        contents_deductible: 1250,
        program_type: 'regular_program',
        rating_type: 'post_firm',
        firm_zone: 'A',
        occupancy_type: 'residential_multi_family',
        floors: 2,
        building_type: 'no_basement_enclosure',
        elevation_above_bfe: 6,
        certification: 'elevation_with_bfe',
        contents_location: 'lowest_floor_and_higher',
        date: new Date('1/1/2019')
      });

      //console.log(premium);

      assert(premium.building_subtotal === 376);
      assert(premium.contents_subtotal === 112);
      assert(premium.combined_subtotal === 488);
      assert(premium.icc_premium === 6);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 74);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 250);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 868);
    });
    it('2019 Rate Example 17', () => {
      const premium = rateTable.getPremium({
        building_coverage: 135000,
        contents_coverage: 60000,
        building_deductible: 1250,
        contents_deductible: 1250,
        program_type: 'regular_program',
        rating_type: 'post_firm',
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

      //console.log(premium);

      assert(premium.building_subtotal === 393);
      assert(premium.contents_subtotal === 105);
      assert(premium.combined_subtotal === 498);
      assert(premium.icc_premium === 6);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 76);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 50);
      assert(premium.combined_total === 655);
    });
    it('PRP Rating Example Table 3A', () => {
      const premium = rateTable.getPremium({
        building_coverage: 200000,
        contents_coverage: 80000,
        building_deductible: 1250,
        contents_deductible: 1250,
        program_type: 'regular_program',
        request_prp: true,
        rating_type: 'post_firm',
        residence_type: 'primary_residence',
        firm_zone: 'X',
        no_disaster_benefits: true,
        building_type: 'no_basement_enclosure',
        no_multiple_claims: true,
        occupancy_type: 'residential_single_family',
        floors: 2,
        date: new Date('1/1/2019')
      });

      //console.log(premium);

      assert(premium.combined_subtotal === 345);
      assert(premium.icc_premium === 5);
      assert(premium.crs_discount === 0);
      assert(premium.reserve_fund_assessment === 53);
      assert(premium.probation_surcharge === 0);
      assert(premium.hfiaa_surcharge === 25);
      assert(premium.federal_policy_fee === 25);
      assert(premium.combined_total === 453);
    });

  });
});
