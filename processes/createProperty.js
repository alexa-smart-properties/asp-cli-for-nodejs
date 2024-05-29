
import * as aspSkills from '../utils/aspSkills.js';
import * as aspProperty from '../utils/aspProperty.js';
import { apiSettings } from '../utils/asp-api-helpers.js';

export async function createProperty(orgid, name, type) {

    apiSettings.apiDelay = 2000;

    if (!orgid) {
        throw new Error("orgid is required as a parameter or set in config/default.json."); 
    }

    let newProperty = await aspProperty.createUnit(orgid, name);

    if (!newProperty.statuscode || newProperty.statuscode > 201) {
        throw new Error("error creating property."); 
    }
    
    await aspSkills.enableSkillForUnit(type, newProperty.id);
    
    let newDefaultParent = await aspProperty.createUnit(newProperty.id, "Default");

    if (!newDefaultParent.statuscode || newDefaultParent.statuscode > 201) {
        throw new Error("error creating default Unit."); 
    }

    apiSettings.apiDelay = 200;

    
    let units = await aspProperty.getUnits(newProperty.id);
    let skills = await aspSkills.listSkillEnablements(newProperty.id);

    return new Object({ id: newProperty.id, name : newProperty.name, units: units.results, skills: skills.items});

} 


