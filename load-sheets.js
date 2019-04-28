const fs = require('fs');
const GoogleSpreadsheet = require('google-spreadsheet');

const nfipSheet = new GoogleSpreadsheet(process.env.NFIP_GOOGLE_SHEET);
const rateTables = [
  '1', '2A', '2B', '2C', '2D', '3A', '3B', '3C', '3D', '3E', '3F',
  '4', '5'
];
const prpRateTables = [ 'PRP_3A', 'PRP_3B' ];

const creds = require('./flood-insurance-manual-0adebe16b50b.json');
/*
const creds = {
  client_email: process.env.NFIP_GOOGLE_SHEET_EMAIL,
  private_key: process.env.NFIP_GOOGLE_SHEET_PK
};
*/

function setAuth() {
  return new Promise((resolve, reject) => nfipSheet.useServiceAccountAuth(creds, resolve));
}
function getNfipSheet() {
  return new Promise((resolve, reject) => {
    nfipSheet.getInfo(function(err, info) {
      if (err) {
        console.error(err);
        return reject(err);
      }
      resolve(info.worksheets)
    });
  });
}
function loadPrpRateTables(sheets) {
  return Promise.all(
    sheets.filter(sheet => prpRateTables.includes(sheet.title))
      .map(sheet => new Promise((resolve, reject) => {

      sheet.getRows({ }, function (err, rows) {
        if (err) return reject(err);

        resolve({
          tableName: sheet.title,
          rows: rows.map(row => ({
            effective_date: Date.parse(row.effectivedate),
            building_coverage: parseInt(row.buildingcoverage),
            contents_coverage: parseInt(row.contentscoverage),
            base_premium: parseInt(row.basepremium),
            building_type: row.buildingtype,
            contents_location: row.contentslocation,
            occupancy_type: row.occupancytype
          }))
        });
      });
  })))
  .then(tables => {
    return tables.reduce((result, table) => {
      result[table.tableName] = table.rows;
      return result;
    }, { });
  });

}
function loadRateTables(sheets) {
  return Promise.all(
    sheets.filter(sheet => rateTables.includes(sheet.title))
      .map(sheet => new Promise((resolve, reject) => {

      sheet.getRows({ }, function (err, rows) {
        if (err) return reject(err);

        resolve({
          tableName: sheet.title,
          rows: rows.map(row => ({
            effective_date: Date.parse(row.effectivedate),
            building_basic: parseFloat(row.buildingbasic),
            building_additional: parseFloat(row.buildingadditional),
            contents_basic: parseFloat(row.contentsbasic),
            contents_additional: parseFloat(row.contentsadditional),
            contents_location: row.contentslocation || null,
            residence_type: row.residencetype || null,
            occupancy_type: row.occupancytype || null,
            building_type: row.buildingtype || null,
            firm_zone: row.firmzone,
            certification: row.certification || null,
            floors: row.floors || null,
            elevation_above_bfe: row.elevationabovebfe || null,
            replacement_cost_ratio: row.replacementcostratio || null
          }))
        });
      });
  })))
  .then(tables => {
    return tables.reduce((result, table) => {
      result[table.tableName] = table.rows;
      return result;
    }, { });
  });
}
function loadLimits(sheets) {
  const limitsTable = sheets.find(sheet => sheet.title === 'Limits');
  return new Promise((resolve, reject) => {
    limitsTable.getRows({ }, (err, rows) => {
      resolve(rows.map(row => ({
        occupancy_type: row.occupancytype,
        building_basic: parseInt(row.buildingbasic),
        building_additional: parseInt(row.buildingadditional),
        contents_basic: parseInt(row.contentsbasic),
        contents_additional: parseInt(row.contentsadditional),
        program_type: row.programtype
      })));
    });
  });
}
function loadPolicies(sheets) {
  const policiesTable = sheets.find(sheet => sheet.title === '8A');
  return new Promise((resolve, reject) => {
    policiesTable.getRows({ }, (err, rows) => {
      resolve(rows.map(row => ({
        firm_zone: row.firmzone,
        rating_type: row.ratingtype,
        program_type: row.programtype,
        policy_type: row.policytype,
        minimum_deductible: row.minimumdeductible,
        building_coverage: row.buildingcoverage,
        certification: row.certification
      })));
    });
  });
}
function loadIccTable(sheets) {
  const iccTable = sheets.find(sheet => sheet.title === '9');
  return new Promise((resolve, reject) => {
    iccTable.getRows({ }, (err, rows) => {
      resolve(rows.map(row => ({
        rate_table: row.ratetable,
        firm_zone: row.firmzone,
        building_type: row.buildingtype,
        rating_type: row.ratingtype,
        elevation_above_bfe: row.elevationabovebfe,
        occupancy_type: row.occupancytype,
        is_elevated: row.iselevated ? new Boolean(row.iselevated).valueOf() : null,
        building_coverage: row.buildingcoverage,
        icc_premium: parseInt(row.iccpremium)
      })));
    });
  });
}
function loadDeductibles(sheets) {
  const deductionsTable = sheets.find(sheet => sheet.title === '8B');
  return new Promise((resolve, reject) => {
    deductionsTable.getRows({ }, (err, rows) => {
      resolve(rows.map(row => ({
        effective_date: Date.parse(row.effectivedate),
        building_deductible: parseInt(row.buildingdeductible),
        contents_deductible: parseInt(row.contentsdeductible),
        deductible_factor_full_risk: parseFloat(row.deductiblefactorfullrisk),
        deductible_factor_subsidized: parseFloat(row.deductiblefactorsubsidized),
        occupancy_type: row.occupancytype
      })));
    });
  });
}
function loadLookupTable(sheets) {
  const lookupTable = sheets.find(sheet => sheet.title === 'Tables');
  return new Promise((resolve, reject) => {
    lookupTable.getRows({ }, function (err, rows) {
      resolve(rows.map(row => ({
        firm_table: row.firmtable,
        firm_zone: row.firmzone,
        rating_type: row.ratingtype,
        residence_type: row.residencetype,
        srl_property: row.srlproperty ? (row.srlproperty === 'TRUE') : null,
        substantially_improved: row.substantiallyimproved ? (row.substantiallyimproved === 'TRUE') : null,
        program_type: row.programtype,
        building_type: row.buildingtype,
        no_disaster_benefits: row.nodisasterbenefits,
        no_multiple_claims: row.nomultipleclaims,
        request_prp: row.requestprp ? (row.requestprp === 'TRUE') : null
        //no_disaster_benefits: row.nodisasterbenefits ? (row.nodisasterbenefits === 'TRUE') : null,
        //no_multiple_claims: row.nomultipleclaims
      })));
    });
  });
}
function writeFile(data) {
  return new Promise((resolve, reject) => {
    fs.writeFile('rate-table.json', JSON.stringify(data, null, 2), err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function load () {
  console.log('loading NFIP tables...');
  try {
    await setAuth();

    const nfipSheet = await getNfipSheet();

    console.log('parsing NFIP tables...');
    const rates = await loadRateTables(nfipSheet);
    const prpRates = await loadPrpRateTables(nfipSheet);
    const lookupTable = await loadLookupTable(nfipSheet);
    const limits = await loadLimits(nfipSheet);
    const deductibles = await loadDeductibles(nfipSheet);
    const policies = await loadPolicies(nfipSheet);
    const icc = await loadIccTable(nfipSheet);

    console.log('writing rate-table.json...');
    await writeFile({
      lookupTable,
      rates: { ...rates, ...prpRates },
      limits,
      deductibles,
      policies,
      icc
    });
  }
  catch (e) {
    console.error(e);
  }

  console.log('done');
}

load();

