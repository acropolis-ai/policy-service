const fs = require('fs');
const GoogleSpreadsheet = require('google-spreadsheet');

const nfipSheet = new GoogleSpreadsheet(process.env.NFIP_GOOGLE_SHEET);
const rateTables = [
  '1', '2A', '2B', '2C', '2D', '3A', '3B', '3C', '3D', '3E', '3F',
  '4', '5'
];

const creds = require('./flood-insurance-manual-0adebe16b50b.json');
/*
const creds = {
  client_email: process.env.NFIP_GOOGLE_SHEET_EMAIL,
  private_key: process.env.NFIP_GOOGLE_SHEET_PK
};
*/

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
function loadBuildingRates(sheets) {
  return Promise.all(
    sheets.filter(sheet => rateTables.includes(sheet.title))
      .map(sheet => new Promise((resolve, reject) => {

      sheet.getRows({ }, function (err, rows) {
        if (err) return reject(err);

        resolve(rows.map(row => ({
          rate_table: row.ratetable,
          effective_date: Date.parse(row.effectivedate),
          building_basic: parseFloat(row.buildingbasic),
          building_additional: parseFloat(row.buildingadditional),
          contents_basic: parseFloat(row.contentsbasic),
          contents_additional: parseFloat(row.contentsadditional),
          contents_location: row.contentslocation || null,
          residence_type: row.residencetype || null,
          occupancy_type: row.occupancytype || null,
          building_type: row.buildingtype || null,
          firm_zone: parseZone(row.firmzone),
          certification: row.certification || null,
          floors: row.floors || null,
          elevation_above_bfe: row.elevationabovebfe || null,
          replacement_cost_ratio: row.replacementcostratio || null
        })));
      });
  })))
  .then(tables => {
    return tables.reduce((result, table) => {
      const tableName = table[0].rate_table
      result[tableName] = table;
      return result;
    }, { });
  });
}
function loadLimits(sheets) {
  const limitsTable = sheets.find(sheet => sheet.title === 'Limits');
  return new Promise((resolve, reject) => {
    limitsTable.getRows({ }, (err, rows) => {
      resolve(rows.map(row => ({
        occupancy: row.occupancy,
        building_basic: parseInt(row.buildingbasic),
        building_additional: parseInt(row.buildingadditional),
        contents_basic: parseInt(row.contentsbasic),
        contents_additional: parseInt(row.contentsadditional),
        program_type: row.programtype
      })));
    });
  });
}
function loadDeductions(sheets) {
  const deductionsTable = sheets.find(sheet => sheet.title === '8B');
  return new Promise((resolve, reject) => {
    deductionsTable.getRows({ }, (err, rows) => {
      resolve(rows.map(row => ({
        effective_date: Date.parse(row.effectivedate),
        building_deductible: parseInt(row.buildingdeductible),
        contents_deductible: parseInt(row.contentsdeductible),
        deductible_factor_full_risk: parseFloat(row.deductiblefactorfullrisk),
        deductible_factor_subsidized: parseFloat(row.deductiblefastersubsidized),
        occupancy_type: row.occupancytype
      })));
    });
  });
}
function loadLookupTable(sheets) {
  const lookupTable = sheets.find(sheet => sheet.title === 'Table Lookup');
  return new Promise((resolve, reject) => {
    lookupTable.getRows({ }, function (err, rows) {
      resolve(rows.map(row => ({
        firm_table: row.firmtable,
        firm_zone: parseZone(row.firmzone),
        construction_date: row.constructiondate,
        residence_type: row.residencetype,
        srl_property: row.srlproperty ? (row.srlproperty === 'TRUE') : null,
        substantially_improved: row.substantiallyimproved ? (row.substantiallyimproved === 'TRUE') : null,
        program_type: row.programtype,
        building_type: row.buildingtype,
        no_disaster_benefits: row.nodisasterbenefits,
        no_multiple_claims: row.nomultipleclaims
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
    const rates = await loadBuildingRates(nfipSheet);
    const lookupTable = await loadLookupTable(nfipSheet);
    const limits = await loadLimits(nfipSheet);
    const deductions = await loadDeductions(nfipSheet);

    console.log('writing rate-table.json...');
    await writeFile({
      lookupTable,
      rates,
      limits,
      deductions
    });
  }
  catch (e) {
    console.error(e);
  }

  console.log('done');
}

load();

