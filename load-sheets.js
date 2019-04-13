const fs = require('fs');
const GoogleSpreadsheet = require('google-spreadsheet');

const nfipSheet = new GoogleSpreadsheet('1PZa11sQCOOGd0qhT27thCc3DK6d4Rl1ysqsne6SbMnk');
const buildingTables = [
  'B-1', 'B-2A', 'B-2B', 'B-2C', 'B-2D', 'B-3A', 'B-3B', 'B-3C', 'B-3D', 'B-3E', 'B-3F',
  'B-4', 'B-5'
];
const contentsTables = [
  'C-1', 'C-2A', 'C-2B', 'C-2C', 'C-2D', 'C-3A', 'C-3B', 'C-3C', 'C-3D', 'C-3E', 'C-3F',
  'C-4', 'C-5'
];

const buildingRates = { };
const contentsRates = { };
const tableLookup = { };

const creds = require('./flood-insurance-manual-0adebe16b50b.json');

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
      if (err) return reject(err);
      resolve(info.worksheets)
    });
  });
}
function loadBuildingRates(sheets) {
  return Promise.all(
    sheets.filter(sheet => buildingTables.includes(sheet.title))
      .map(sheet => new Promise((resolve, reject) => {

      sheet.getRows({ }, function (err, rows) {
        if (err) return reject(err);

        resolve(rows.map(row => ({
          rate_table: row.ratetable,
          effective_date: Date.parse(row.effectivedate),
          building_basic: parseFloat(row.buildingbasic),
          building_additional: parseFloat(row.buildingadditional),
          residence_type: row.residencetype || null,
          occupancy_type: row.occupancytype || null,
          building_type: row.buildingtype || null,
          firm_zone: parseZone(row.firmzone),
          certification: row.certification || null,
          floors: row.floors,
          elevation_above_bfe: row.elevationabovebfe,
          replacement_cost_ratio: row.replacementcostratio
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
function loadContentsRates(step) {
  results.contentsRates = [ ];
  /*
  sheets.contentsRates.getRows({ }, function (err, rows) {
    results.contentsRates = rows.map(row => ({
      rate_table: row.ratetable,
      effective_date: Date.parse(row.effectivedate),
      contents_basic: parseFloat(row.buildingbasic),
      contents_additional: parseFloat(row.buildingadditional),
      residence_type: row.residencetype || null,
      occupancy_type: row.occupancytype || null,
      building_type: row.buildingtype || null,
      firm_zone: parseZone(row.firmzone),
      certification: row.certification || null,
      floors: row.floors,
      elevation_above_bfe: row.elevationabovebfe,
      replacement_cost_ratio: row.replacementcostratio
    }));

    step();
  });
  */
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
        building_type: row.buildingtype
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
  await setAuth();
  const nfipSheet = await getNfipSheet();
  const buildingRates = await loadBuildingRates(nfipSheet);
  const lookupTable = await loadLookupTable(nfipSheet);
  console.log('writing rate-table.json...');
  await writeFile({ lookupTable, buildingRates });

  console.log('done');
}

load();

