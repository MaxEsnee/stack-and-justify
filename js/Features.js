import { Feature } from './Feature.js';
import { Fonts } from './Fonts.js';
import { generateUID } from "./Helpers.js";

export const Features = (function() {
	const features = [];

	// Update the feature list when a new font is added
	addEventListener('font-added', (e) => {
		const font = e.detail.font;
		const familyName = font.info.familyName;
		const familyId = generateUID(familyName);
		const fontFeatures = font.info.features;

		if (fontFeatures === undefined || fontFeatures.length === 0) return;

		// Group the features by family names
		let familyGroup = features.find(family => family.name === familyName);
		if (!familyGroup) {
			familyGroup = {
				name: familyName,
				id: familyId,
				features: []
			}
			features.push(familyGroup);
		}

		fontFeatures.forEach(fontFeature => {
			// Allow for duplicate features if they have different names
 			// This allow for multiple version of the same stylistic sets inside a family
			if (!familyGroup.features.some(feature => feature.name === fontFeature.name)) {
				// Add the feature
				const feature = Feature(fontFeature.tag, fontFeature.name);
				feature.fontIds.push(font.id);
				familyGroup.features.push(feature);
			} else {
				familyGroup.features.find(feature => feature.name === fontFeature.name).fontIds.push(font.id);
			}
		});

		// Sort by tag name
		familyGroup.features.sort((feaA, feaB) => feaA.tag > feaB.tag);
	});

	function get(id) {
		for (const familyGroup of features) {
			for (const feature of familyGroup.features) {
				if (feature.id === id) {
					return feature;
				}
			}
		}
	}

	function css(fontId) {
		let str = "";
		let featureStrings = [];

		for (const familyGroup of features) {
			familyGroup.features.forEach(feature => {
				if (feature.fontIds.includes(fontId)) {
					if (feature.selected) {
						featureStrings.push(`"${feature.tag}"`);
					} else {
						featureStrings.push(`"${feature.tag}" off`);
					}
				}
			});
		}

		str = featureStrings.join(',');
		return str;
	}


	return {
		list: features,
		css,
		get
	}
})();

