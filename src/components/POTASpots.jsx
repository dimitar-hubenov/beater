// src/components/POTASpots.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { gridToPoint } from '@hamlog/maidenhead';

// ============== COLOR SCHEME DEFINITIONS ==============
const COLOR_SCHEME = {
	// Primary brand colors
	primary: {
		bg: 'bg-linear-to-br from-gray-900 to-gray-950',
		text: 'text-gray-100',
		border: 'border-gray-700',
		accent: 'text-blue-400'
	},

	// Band colors - for filter buttons and table display
	bands: {
		'160m': {
			filter: 'bg-gray-700 hover:bg-gray-600 text-gray-100 ring-gray-500',
			filterSelected: 'bg-gray-800 text-white ring-2 ring-gray-400',
			badge: 'bg-gray-800 text-gray-300'
		},
		'80m': {
			filter: 'bg-indigo-700 hover:bg-indigo-600 text-indigo-100 ring-indigo-500',
			filterSelected: 'bg-indigo-800 text-white ring-2 ring-indigo-400',
			badge: 'bg-indigo-800/30 text-indigo-300'
		},
		'60m': {
			filter: 'bg-purple-700 hover:bg-purple-600 text-purple-100 ring-purple-500',
			filterSelected: 'bg-purple-800 text-white ring-2 ring-purple-400',
			badge: 'bg-purple-800/30 text-purple-300'
		},
		'40m': {
			filter: 'bg-blue-700 hover:bg-blue-600 text-blue-100 ring-blue-500',
			filterSelected: 'bg-blue-800 text-white ring-2 ring-blue-400',
			badge: 'bg-blue-800/30 text-blue-300'
		},
		'30m': {
			filter: 'bg-cyan-700 hover:bg-cyan-600 text-cyan-100 ring-cyan-500',
			filterSelected: 'bg-cyan-800 text-white ring-2 ring-cyan-400',
			badge: 'bg-cyan-800/30 text-cyan-300'
		},
		'20m': {
			filter: 'bg-teal-700 hover:bg-teal-600 text-teal-100 ring-teal-500',
			filterSelected: 'bg-teal-800 text-white ring-2 ring-teal-400',
			badge: 'bg-teal-800/30 text-teal-300'
		},
		'17m': {
			filter: 'bg-emerald-700 hover:bg-emerald-600 text-emerald-100 ring-emerald-500',
			filterSelected: 'bg-emerald-800 text-white ring-2 ring-emerald-400',
			badge: 'bg-emerald-800/30 text-emerald-300'
		},
		'15m': {
			filter: 'bg-green-700 hover:bg-green-600 text-green-100 ring-green-500',
			filterSelected: 'bg-green-800 text-white ring-2 ring-green-400',
			badge: 'bg-green-800/30 text-green-300'
		},
		'12m': {
			filter: 'bg-lime-700 hover:bg-lime-600 text-lime-100 ring-lime-500',
			filterSelected: 'bg-lime-800 text-white ring-2 ring-lime-400',
			badge: 'bg-lime-800/30 text-lime-300'
		},
		'10m': {
			filter: 'bg-yellow-700 hover:bg-yellow-600 text-yellow-100 ring-yellow-500',
			filterSelected: 'bg-yellow-800 text-white ring-2 ring-yellow-400',
			badge: 'bg-yellow-800/30 text-yellow-300'
		},
		'6m': {
			filter: 'bg-amber-700 hover:bg-amber-600 text-amber-100 ring-amber-500',
			filterSelected: 'bg-amber-800 text-white ring-2 ring-amber-400',
			badge: 'bg-amber-800/30 text-amber-300'
		},
		'2m': {
			filter: 'bg-orange-700 hover:bg-orange-600 text-orange-100 ring-orange-500',
			filterSelected: 'bg-orange-800 text-white ring-2 ring-orange-400',
			badge: 'bg-orange-800/30 text-orange-300'
		}
	},

	// Mode colors - for filter buttons and table badges
	modes: {
		'SSB': {
			filter: 'bg-blue-700 hover:bg-blue-600 text-blue-100 ring-blue-500',
			filterSelected: 'bg-blue-800 text-white ring-2 ring-blue-400',
			badge: 'bg-blue-800/30 text-blue-300'
		},
		'CW': {
			filter: 'bg-yellow-700 hover:bg-yellow-600 text-yellow-100 ring-yellow-500',
			filterSelected: 'bg-yellow-800 text-white ring-2 ring-yellow-400',
			badge: 'bg-yellow-800/30 text-yellow-300'
		},
		'DATA': {
			filter: 'bg-purple-700 hover:bg-purple-600 text-purple-100 ring-purple-500',
			filterSelected: 'bg-purple-800 text-white ring-2 ring-purple-400',
			badge: 'bg-purple-800/30 text-purple-300'
		},
		'FM': {
			filter: 'bg-green-700 hover:bg-green-600 text-green-100 ring-green-500',
			filterSelected: 'bg-green-800 text-white ring-2 ring-green-400',
			badge: 'bg-green-800/30 text-green-300'
		},
		'AM': {
			filter: 'bg-red-700 hover:bg-red-600 text-red-100 ring-red-500',
			filterSelected: 'bg-red-800 text-white ring-2 ring-red-400',
			badge: 'bg-red-800/30 text-red-300'
		},
		// Default for unknown modes
		'default': {
			filter: 'bg-gray-700 hover:bg-gray-600 text-gray-100 ring-gray-500',
			filterSelected: 'bg-gray-800 text-white ring-2 ring-gray-400',
			badge: 'bg-gray-800/30 text-gray-300'
		}
	},

	// Filter type colors (for active filters display)
	filterTypes: {
		activator: 'bg-purple-900/50 text-purple-300 border-purple-700',
		park: 'bg-blue-900/50 text-blue-300 border-blue-700',
		band: 'bg-indigo-900/50 text-indigo-300 border-indigo-700',
		mode: 'bg-purple-900/50 text-purple-300 border-purple-700',
		time: 'bg-cyan-900/50 text-cyan-300 border-cyan-700',
		distance: 'bg-emerald-900/50 text-emerald-300 border-emerald-700'
	},

	// Distance colors
	distanceZones: {
		skip: 'text-yellow-400',
		near: 'text-green-400',
		medium: 'text-orange-400',
		far: 'text-red-400',
		unknown: 'text-gray-500'
	},

	// UI state colors
	state: {
		success: 'bg-green-500 hover:bg-green-600',
		warning: 'bg-yellow-500 hover:bg-yellow-600',
		error: 'bg-red-500 hover:bg-red-600',
		info: 'bg-blue-500 hover:bg-blue-600',
		disabled: 'bg-gray-600 text-gray-400'
	}
};

const BANDS = [
	{ id: '160m', label: '160m (1.8-2.0 MHz)', min: 1800, max: 2000 },
	{ id: '80m', label: '80m (3.5-4.0 MHz)', min: 3500, max: 4000 },
	{ id: '60m', label: '60m (5.3-5.4 MHz)', min: 5300, max: 5400 },
	{ id: '40m', label: '40m (7.0-7.3 MHz)', min: 7000, max: 7300 },
	{ id: '30m', label: '30m (10.1-10.15 MHz)', min: 10100, max: 10150 },
	{ id: '20m', label: '20m (14.0-14.35 MHz)', min: 14000, max: 14350 },
	{ id: '17m', label: '17m (18.068-18.168 MHz)', min: 18068, max: 18168 },
	{ id: '15m', label: '15m (21.0-21.45 MHz)', min: 21000, max: 21450 },
	{ id: '12m', label: '12m (24.89-24.99 MHz)', min: 24890, max: 24990 },
	{ id: '10m', label: '10m (28.0-29.7 MHz)', min: 28000, max: 29700 },
	{ id: '6m', label: '6m (50-54 MHz)', min: 50000, max: 54000 },
	{ id: '2m', label: '2m (144-148 MHz)', min: 144000, max: 148000 },
];

const BAND_DISTANCE_ZONES = {
	// HF Bands
	'160m': { skip: 50, near: 200, far: 800 },
	'80m': { skip: 50, near: 300, far: 1000 },
	'60m': { skip: 50, near: 300, far: 1200 },
	'40m': { skip: 100, near: 500, far: 1500 },
	'30m': { skip: 150, near: 800, far: 2000 },
	'20m': { skip: 200, near: 1000, far: 3000 },
	'17m': { skip: 200, near: 1000, far: 3500 },
	'15m': { skip: 300, near: 1500, far: 4000 },
	'12m': { skip: 300, near: 1500, far: 4500 },
	'10m': { skip: 1200, near: 2000, far: 5000 },
	// VHF/UHF Bands (higher frequencies, shorter distance, line-of-sight)
	'6m': { skip: 0, near: 100, far: 500 },
	'2m': { skip: 0, near: 50, far: 200 }
};

// Helper to get distance color class
const getDistanceColor = (distance, bandId) => {
	console.log(`Getting distance color for distance: ${distance}, bandId: ${bandId}`);
	if (distance === null || distance === undefined) {
		return COLOR_SCHEME.distanceZones.unknown;
	}

	const zones = BAND_DISTANCE_ZONES[bandId] || BAND_DISTANCE_ZONES['20m'];

	console.log(`Distance: ${distance} km, Band: ${bandId}, Zones:`, zones);

	if (distance < zones.skip) return COLOR_SCHEME.distanceZones.skip;
	if (distance < zones.near) return COLOR_SCHEME.distanceZones.near;
	if (distance < zones.far) return COLOR_SCHEME.distanceZones.medium;
	return COLOR_SCHEME.distanceZones.far;
};

// Helper to get band color class
const getBandColor = (bandId, type = 'filter', isSelected = false) => {
	const bandColors = COLOR_SCHEME.bands[bandId] || COLOR_SCHEME.bands['160m'];
	return isSelected ? bandColors.filterSelected : bandColors[type];
};

// Helper to get mode color class
const getModeColor = (modeId, type = 'filter', isSelected = false) => {
	const modeColors = COLOR_SCHEME.modes[modeId] || COLOR_SCHEME.modes.default;
	return isSelected ? modeColors.filterSelected : modeColors[type];
};

// ============== ICON COMPONENTS ==============
const ExportIcon = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor"
	>
		<path
			fillRule="evenodd"
			d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
			clipRule="evenodd"
		/>
	</svg>
);

const ImportIcon = ({ className = "w-5 h-5" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor"
	>
		<path
			fillRule="evenodd"
			d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z"
			clipRule="evenodd"
		/>
		<path
			fillRule="evenodd"
			d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z"
			clipRule="evenodd"
		/>
	</svg>
);

const ResetIcon = ({ className = "w-4 h-4" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor"
	>
		<path
			fillRule="evenodd"
			d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
			clipRule="evenodd"
		/>
	</svg>
);

const CloseIcon = ({ className = "w-4 h-4" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		viewBox="0 0 20 20"
		fill="currentColor"
	>
		<path
			fillRule="evenodd"
			d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
			clipRule="evenodd"
		/>
	</svg>
);

// ============== UTILITY FUNCTIONS ==============
const parseUTCDate = (dateString) => {
	return new Date(dateString + (dateString.endsWith('Z') ? '' : 'Z'));
};

const getUTCAgeMinutes = (dateString) => {
	const spotTime = parseUTCDate(dateString).getTime();
	const nowUTC = Date.now();
	return (nowUTC - spotTime) / (1000 * 60);
};

const formatLocalTime = (dateString) => {
	const date = parseUTCDate(dateString);
	const ageMinutes = getUTCAgeMinutes(dateString);

	if (ageMinutes < 1) return 'Just now';
	if (ageMinutes < 60) return `${Math.floor(ageMinutes)}m ago`;
	if (ageMinutes < 1440) return `${Math.floor(ageMinutes / 60)}h ago`;
	return date.toLocaleDateString();
};

const formatTimeForTable = (dateString) => {
	const date = parseUTCDate(dateString);
	return date.toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		timeZoneName: 'short'
	});
};

const publicUrl = (path) => {
	return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

// ============== CONSTANTS ==============
const MODES = [
	{ id: 'SSB', label: 'SSB (USB/LSB)' },
	{ id: 'CW', label: 'CW' },
	{ id: 'DATA', label: 'DATA (FT8, FT4, etc.)' },
	{ id: 'FM', label: 'FM' },
	{ id: 'AM', label: 'AM' },
];

const MODE_CATEGORIES = {
	'SSB': ['SSB', 'USB', 'LSB'],
	'CW': ['CW'],
	'DATA': ['FT8', 'FT4', 'RTTY', 'PSK', 'JT65', 'JT9', 'MSK144', 'Q65', 'JT65C', 'FST4', 'FST4W', 'QRA64', 'ISCAT', 'JT4', 'JT9A', 'WSPR'],
	'AM': ['AM'],
	'FM': ['FM'],
};

const getModeCategory = (mode) => {
	if (!mode) return null;
	const modeUpper = mode.toUpperCase();

	if (MODE_CATEGORIES.SSB.includes(modeUpper)) return 'SSB';
	if (MODE_CATEGORIES.CW.includes(modeUpper)) return 'CW';
	if (MODE_CATEGORIES.DATA.includes(modeUpper)) return 'DATA';
	if (MODE_CATEGORIES.AM.includes(modeUpper)) return 'AM';
	if (MODE_CATEGORIES.FM.includes(modeUpper)) return 'FM';
	return null;
};

const FILTERS_STORAGE_KEY = 'pota_app_filters_v2';
const DEFAULT_FILTERS = {
	parkReference: '',
	selectedBands: [],
	selectedModes: [],
	maxAgeMinutes: 30,
	maxDistance: 0,
	userGrid: '',
	activatorCallsign: '',
};

const saveFiltersToStorage = (filters) => {
	try {
		const serialized = JSON.stringify({
			...filters,
			_timestamp: new Date().toISOString(),
			_version: '2.0'
		});
		localStorage.setItem(FILTERS_STORAGE_KEY, serialized);
	} catch (error) {
		console.warn('Failed to save filters to localStorage:', error);
	}
};

const loadFiltersFromStorage = () => {
	try {
		const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
		if (!saved) return null;

		const parsed = JSON.parse(saved);
		return {
			parkReference: parsed.parkReference || DEFAULT_FILTERS.parkReference,
			selectedBands: Array.isArray(parsed.selectedBands) ? parsed.selectedBands : DEFAULT_FILTERS.selectedBands,
			selectedModes: Array.isArray(parsed.selectedModes) ? parsed.selectedModes : DEFAULT_FILTERS.selectedModes,
			maxAgeMinutes: typeof parsed.maxAgeMinutes === 'number' ? parsed.maxAgeMinutes : DEFAULT_FILTERS.maxAgeMinutes,
			maxDistance: typeof parsed.maxDistance === 'number' ? parsed.maxDistance : DEFAULT_FILTERS.maxDistance,
			userGrid: parsed.userGrid || DEFAULT_FILTERS.userGrid,
			activatorCallsign: parsed.activatorCallsign || DEFAULT_FILTERS.activatorCallsign,
		};
	} catch (error) {
		console.warn('Failed to load filters from localStorage:', error);
		return null;
	}
};

const matchCallsign = (callsign, patternInput) => {
	if (!patternInput || !callsign) return false;

	const callsignUpper = callsign.toUpperCase();
	const patterns = patternInput
		.toUpperCase()
		.split(',')
		.map(p => p.trim())
		.filter(p => p.length > 0);

	if (patterns.length === 0) return false;

	return patterns.some(pattern => {
		if (!pattern.includes('*')) {
			return callsignUpper.includes(pattern);
		}

		if (pattern.includes('*')) {
			const parts = pattern.split('*');

			if (parts.length > 2) {
				const regexPattern = pattern.replace(/\*/g, '.*');
				const regex = new RegExp(`^${regexPattern}$`, 'i');
				return regex.test(callsign);
			}

			if (pattern.startsWith('*') && pattern.endsWith('*')) {
				const middle = pattern.slice(1, -1);
				return middle === '' || callsignUpper.includes(middle);
			} else if (pattern.startsWith('*')) {
				const suffix = pattern.slice(1);
				return suffix === '' || callsignUpper.endsWith(suffix);
			} else if (pattern.endsWith('*')) {
				const prefix = pattern.slice(0, -1);
				return prefix === '' || callsignUpper.startsWith(prefix);
			} else {
				const [prefix, suffix] = parts;
				return callsignUpper.startsWith(prefix) && callsignUpper.endsWith(suffix);
			}
		}

		return false;
	});
};

const matchParkReference = (reference, patternInput) => {
	if (!patternInput || !reference) return false;

	const referenceUpper = reference.toUpperCase();
	const patterns = patternInput
		.toUpperCase()
		.split(',')
		.map(p => p.trim())
		.filter(p => p.length > 0);

	if (patterns.length === 0) return false;

	return patterns.some(pattern => {
		if (!pattern.includes('*')) {
			return referenceUpper === pattern;
		}

		if (pattern === '*') {
			return true;
		}

		const regexPattern = pattern
			.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
			.replace(/\*/g, '.*');

		try {
			const regex = new RegExp(`^${regexPattern}$`, 'i');
			return regex.test(reference);
		} catch (err) {
			console.warn(`Invalid park reference pattern "${pattern}":`, err);
			return false;
		}
	});
};

// ============== MAIN COMPONENT ==============
const POTASpots = () => {
	// State for data and loading
	const [spots, setSpots] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Filter states - initialized from localStorage or defaults
	const [filtersLoaded, setFiltersLoaded] = useState(false);
	const [parkReference, setParkReference] = useState(DEFAULT_FILTERS.parkReference);
	const [selectedBands, setSelectedBands] = useState(DEFAULT_FILTERS.selectedBands);
	const [selectedModes, setSelectedModes] = useState(DEFAULT_FILTERS.selectedModes);
	const [maxAgeMinutes, setMaxAgeMinutes] = useState(DEFAULT_FILTERS.maxAgeMinutes);
	const [activatorCallsign, setActivatorCallsign] = useState(DEFAULT_FILTERS.activatorCallsign);
	const [userGrid, setUserGrid] = useState(DEFAULT_FILTERS.userGrid);
	const [maxDistance, setMaxDistance] = useState(DEFAULT_FILTERS.maxDistance);

	// Other states
	const [parksData, setParksData] = useState({});
	const [loadingParks, setLoadingParks] = useState(false);
	const [userCoords, setUserCoords] = useState(null);
	const [sortConfig, setSortConfig] = useState({
		key: 'time',
		direction: 'desc'
	});

	// Load all filters from localStorage on component mount
	useEffect(() => {
		const savedFilters = loadFiltersFromStorage();
		if (savedFilters) {
			setParkReference(savedFilters.parkReference);
			setSelectedBands(savedFilters.selectedBands);
			setSelectedModes(savedFilters.selectedModes);
			setMaxAgeMinutes(savedFilters.maxAgeMinutes);
			setMaxDistance(savedFilters.maxDistance);
			setUserGrid(savedFilters.userGrid);
			setActivatorCallsign(savedFilters.activatorCallsign);
		}
		setFiltersLoaded(true);
	}, []);

	// Save filters to localStorage whenever they change
	useEffect(() => {
		if (!filtersLoaded) return;

		const currentFilters = {
			parkReference,
			selectedBands,
			selectedModes,
			maxAgeMinutes,
			maxDistance,
			userGrid,
			activatorCallsign,
		};

		saveFiltersToStorage(currentFilters);
	}, [
		filtersLoaded,
		parkReference,
		selectedBands,
		selectedModes,
		maxAgeMinutes,
		maxDistance,
		userGrid,
		activatorCallsign,
	]);

	// Load parks data on component mount
	useEffect(() => {
		const loadParksData = async () => {
			try {
				setLoadingParks(true);
				const response = await fetch(publicUrl('/data/pota-parks.json'));
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();

				const parksMap = {};
				data.forEach(park => {
					parksMap[park.reference] = {
						lat: parseFloat(park.latitude),
						lon: parseFloat(park.longitude),
						grid: park.grid,
						name: park.name
					};
				});
				setParksData(parksMap);
			} catch (err) {
				console.warn('Could not load parks data:', err);
			} finally {
				setLoadingParks(false);
			}
		};

		loadParksData();
	}, []);

	// Convert user's grid to coordinates when it changes
	useEffect(() => {
		if (userGrid && (userGrid.length === 4 || userGrid.length === 6)) {
			try {
				const coords = gridToPoint(userGrid.toUpperCase());
				setUserCoords({ latitude: coords.lat, longitude: coords.lon });
			} catch (err) {
				console.error('Invalid grid square:', err);
				setUserCoords(null);
			}
		} else {
			setUserCoords(null);
		}
	}, [userGrid]);

	// Fetch spots data
	useEffect(() => {
		const fetchSpots = async () => {
			try {
				setLoading(true);
				const response = await fetch('https://api.pota.app/spot/activator');
				if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
				const data = await response.json();
				setSpots(data);
				setError(null);
			} catch (err) {
				setError(err.message);
				console.error('Error fetching spots:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchSpots();
		const intervalId = setInterval(fetchSpots, 60000);
		return () => clearInterval(intervalId);
	}, []);

	// Haversine formula to calculate distance between two coordinates in km
	const calculateDistance = (lat1, lon1, lat2, lon2) => {
		const R = 6371;
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLon = (lon2 - lon1) * Math.PI / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	// Handle band selection
	const handleBandToggle = useCallback((bandId) => {
		setSelectedBands(prev =>
			prev.includes(bandId)
				? prev.filter(id => id !== bandId)
				: [...prev, bandId]
		);
	}, []);

	// Handle mode selection
	const handleModeToggle = useCallback((modeId) => {
		setSelectedModes(prev =>
			prev.includes(modeId)
				? prev.filter(id => id !== modeId)
				: [...prev, modeId]
		);
	}, []);

	const handleSort = (key) => {
		setSortConfig(currentConfig => {
			if (currentConfig.key === key) {
				return {
					key,
					direction: currentConfig.direction === 'asc' ? 'desc' : 'asc'
				};
			}
			return {
				key,
				direction: 'desc'
			};
		});
	};

	// Select all bands
	const selectAllBands = useCallback(() => {
		setSelectedBands(BANDS.map(band => band.id));
	}, []);

	// Clear all bands
	const clearAllBands = useCallback(() => {
		setSelectedBands([]);
	}, []);

	// Select all modes
	const selectAllModes = useCallback(() => {
		setSelectedModes(MODES.map(mode => mode.id));
	}, []);

	// Clear all modes
	const clearAllModes = useCallback(() => {
		setSelectedModes([]);
	}, []);

	// Reset all filters to defaults and clear storage
	const resetFilters = useCallback(() => {
		setParkReference(DEFAULT_FILTERS.parkReference);
		setSelectedBands(DEFAULT_FILTERS.selectedBands);
		setSelectedModes(DEFAULT_FILTERS.selectedModes);
		setMaxAgeMinutes(DEFAULT_FILTERS.maxAgeMinutes);
		setMaxDistance(DEFAULT_FILTERS.maxDistance);
		setUserGrid(DEFAULT_FILTERS.userGrid);
		setActivatorCallsign(DEFAULT_FILTERS.activatorCallsign);
		localStorage.removeItem(FILTERS_STORAGE_KEY);
	}, []);

	// Export filters as JSON
	const exportFilters = useCallback(() => {
		const filters = {
			parkReference,
			selectedBands,
			selectedModes,
			maxAgeMinutes,
			maxDistance,
			userGrid,
			activatorCallsign,
			exportDate: new Date().toISOString(),
		};

		const dataStr = JSON.stringify(filters, null, 2);
		const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

		const exportFileDefaultName = `pota_filters_${new Date().toISOString().split('T')[0]}.json`;

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	}, [parkReference, selectedBands, selectedModes, maxAgeMinutes, maxDistance, userGrid, activatorCallsign]);

	// Import filters from JSON file
	const importFilters = useCallback((event) => {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const imported = JSON.parse(e.target.result);

				const validated = {
					parkReference: imported.parkReference || DEFAULT_FILTERS.parkReference,
					selectedBands: Array.isArray(imported.selectedBands) ? imported.selectedBands : DEFAULT_FILTERS.selectedBands,
					selectedModes: Array.isArray(imported.selectedModes) ? imported.selectedModes : DEFAULT_FILTERS.selectedModes,
					maxAgeMinutes: typeof imported.maxAgeMinutes === 'number' ? imported.maxAgeMinutes : DEFAULT_FILTERS.maxAgeMinutes,
					maxDistance: typeof imported.maxDistance === 'number' ? imported.maxDistance : DEFAULT_FILTERS.maxDistance,
					userGrid: imported.userGrid || DEFAULT_FILTERS.userGrid,
					activatorCallsign: imported.activatorCallsign || DEFAULT_FILTERS.activatorCallsign,
				};

				setParkReference(validated.parkReference);
				setSelectedBands(validated.selectedBands);
				setSelectedModes(validated.selectedModes);
				setMaxAgeMinutes(validated.maxAgeMinutes);
				setMaxDistance(validated.maxDistance);
				setUserGrid(validated.userGrid);
				setActivatorCallsign(validated.activatorCallsign);

				alert('Filters imported successfully!');
			} catch (error) {
				alert('Error importing filters. Please check the file format.');
				console.error('Import error:', error);
			}
		};
		reader.readAsText(file);
		event.target.value = '';
	}, []);

	// Filter spots
	const filteredSpots = useMemo(() => {
		return spots.filter(spot => {
			if (spot.invalid != null && spot.invalid !== false && spot.invalid !== '') {
				if (spot.invalid === true ||
					spot.invalid === 'true' ||
					spot.invalid === '1' ||
					(typeof spot.invalid === 'string' && spot.invalid.trim().length > 0)) {
					return false;
				}
			}

			if (spot.comments && spot.comments.toLowerCase().includes('qrt')) {
				return false;
			}

			if (parkReference) {
				if (!matchParkReference(spot.reference, parkReference)) {
					return false;
				}
			}

			if (selectedBands.length > 0) {
				const freqKhz = parseFloat(spot.frequency);
				const isInSelectedBand = selectedBands.some(bandId => {
					const band = BANDS.find(b => b.id === bandId);
					return band && freqKhz >= band.min && freqKhz <= band.max;
				});
				if (!isInSelectedBand) return false;
			}

			if (selectedModes.length > 0) {
				const spotCategory = getModeCategory(spot.mode);
				if (!spotCategory || !selectedModes.includes(spotCategory)) {
					return false;
				}
			}

			if (maxAgeMinutes > 0) {
				const ageMinutes = getUTCAgeMinutes(spot.spotTime);
				if (ageMinutes > maxAgeMinutes) {
					return false;
				}
			}

			if (maxDistance > 0 && userCoords && parksData[spot.reference]) {
				const park = parksData[spot.reference];
				const distance = calculateDistance(
					userCoords.latitude,
					userCoords.longitude,
					park.lat,
					park.lon
				);
				if (distance > maxDistance) {
					return false;
				}
			}

			if (activatorCallsign) {
				if (!matchCallsign(spot.activator, activatorCallsign)) {
					return false;
				}
			}

			return true;
		}).map(spot => {
			let distance = null;
			if (userCoords && parksData[spot.reference]) {
				const park = parksData[spot.reference];
				distance = calculateDistance(
					userCoords.latitude,
					userCoords.longitude,
					park.lat,
					park.lon
				);
			}

			return {
				...spot,
				distance: distance !== null ? Math.round(distance) : null
			};
		});
	}, [spots, activatorCallsign, parkReference, selectedBands, selectedModes, maxAgeMinutes, maxDistance, userCoords, parksData]);

	// Sort spots
	const sortedSpots = useMemo(() => {
		if (filteredSpots.length === 0) return [];

		const spotsToSort = [...filteredSpots];

		return spotsToSort.sort((a, b) => {
			const getValue = (spot, key) => {
				switch (key) {
					case 'activator':
						return spot.activator?.toUpperCase() || '';
					case 'frequency':
						return parseFloat(spot.frequency) || 0;
					case 'mode':
						return getModeCategory(spot.mode) || spot.mode || '';
					case 'reference':
						return spot.reference?.toUpperCase() || '';
					case 'distance':
						if (spot.distance === null) return sortConfig.direction === 'asc' ? Infinity : -Infinity;
						return spot.distance;
					case 'time':
						return new Date(spot.spotTime).getTime();
					default:
						return '';
				}
			};

			const aValue = getValue(a, sortConfig.key);
			const bValue = getValue(b, sortConfig.key);

			let comparison = 0;
			if (typeof aValue === 'string' && typeof bValue === 'string') {
				comparison = aValue.localeCompare(bValue);
			} else {
				comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
			}

			return sortConfig.direction === 'asc' ? comparison : comparison * -1;
		});
	}, [filteredSpots, sortConfig]);

	if (loading && spots.length === 0) {
		return (
			<div className={`min-h-screen ${COLOR_SCHEME.primary.bg} flex items-center justify-center`}>
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<p className="text-gray-300">Loading POTA spots...</p>
				</div>
			</div>
		);
	}

	return (
		<div className={`min-h-screen ${COLOR_SCHEME.primary.bg} ${COLOR_SCHEME.primary.text} p-4 md:p-6`}>
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<header className="mb-8">
					<div className="flex flex-wrap justify-between items-center">
						<div>
							<h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
								POTA Activator Spots
							</h1>
							<p className="text-gray-400">
								Real-time Parks on the Air activator monitoring
							</p>
						</div>
						<div className="flex gap-2 mt-4 md:mt-0">
							{/* Export Filters Button */}
							<button
								onClick={exportFilters}
								className="p-2 bg-blue-800/50 hover:bg-blue-700/50 rounded-lg transition-colors border border-blue-700 flex items-center justify-center group relative"
								title="Export filters to JSON file"
							>
								<ExportIcon className="w-5 h-5 text-blue-300" />
								<span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-gray-100 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
									Export Filters as CSV
								</span>
							</button>

							{/* Import Filters Button */}
							<label className="p-2 bg-purple-800/50 hover:bg-purple-700/50 rounded-lg transition-colors border border-purple-700 flex items-center justify-center cursor-pointer group relative">
								<ImportIcon className="w-5 h-5 text-purple-300" />
								<span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-gray-100 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
									Import Filters from CSV
								</span>
								<input
									type="file"
									accept=".json"
									onChange={importFilters}
									className="hidden"
								/>
							</label>
						</div>
					</div>
				</header>

				{error && (
					<div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
						<p className="text-red-300">Error: {error}</p>
						<button
							onClick={() => window.location.reload()}
							className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors"
						>
							Retry
						</button>
					</div>
				)}

				{/* Filters Section */}
				<div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8">
					<div className="flex flex-wrap items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-white">Filters</h2>
						<div className="flex gap-2">
							<button
								onClick={resetFilters}
								className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm flex items-center gap-2 group"
								title="Reset all filters to defaults"
							>
								<ResetIcon className="w-4 h-4" />
								<span>Reset All</span>
								<span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-gray-100 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
									Reset All Filters
								</span>
							</button>
						</div>
					</div>

					{/* Row 1: Activator & Country */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						{/* Left: Activator Callsign */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Activator Callsign
							</label>
							<input
								type="text"
								value={activatorCallsign}
								onChange={(e) => setActivatorCallsign(e.target.value.toUpperCase())}
								placeholder="K1ABC, K1*, *ABC, W2*, VE3*"
								className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
							/>
							<div className="text-xs text-gray-500 mt-2 space-y-1">
								<div>
									<span className="text-gray-400">Examples: </span>
									<code className="mx-1 px-1.5 py-0.5 bg-gray-900 rounded">K1ABC</code>
									<code className="mx-1 px-1.5 py-0.5 bg-gray-900 rounded">K1*,W2*</code>
									<code className="mx-1 px-1.5 py-0.5 bg-gray-900 rounded">*/P,*/M</code>
								</div>
							</div>
						</div>

						{/* Right: Park Reference */}
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Park Reference
							</label>
							<input
								type="text"
								value={parkReference}
								onChange={(e) => setParkReference(e.target.value.toUpperCase())}
								placeholder="US-0001, K-*, VE-1*, *-1234"
								className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
							/>
							<div className="text-xs text-gray-500 mt-2">
								Use commas for multiple references. Supports wildcards (*). Examples: US-1234, K-*, VE-1*, *-1234
							</div>
						</div>
					</div>

					{/* Row 2: Bands */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-3">
							<label className="text-sm font-medium text-gray-300">Bands</label>
							<div className="flex gap-2">
								<button
									onClick={selectAllBands}
									className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
								>
									Select All
								</button>
								<button
									onClick={clearAllBands}
									className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
								>
									Clear All
								</button>
							</div>
						</div>
						<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
							{BANDS.map((band) => (
								<button
									key={band.id}
									onClick={() => handleBandToggle(band.id)}
									className={`px-3 py-2 rounded-lg text-sm transition-all ${getBandColor(band.id, 'filter', selectedBands.includes(band.id))}`}
								>
									{band.id}
								</button>
							))}
						</div>
					</div>

					{/* Row 3: Modes (Grouped) */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-3">
							<label className="text-sm font-medium text-gray-300">Modes</label>
							<div className="flex gap-2">
								<button
									onClick={selectAllModes}
									className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
								>
									Select All
								</button>
								<button
									onClick={clearAllModes}
									className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
								>
									Clear All
								</button>
							</div>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
							{MODES.map((mode) => (
								<button
									key={mode.id}
									onClick={() => handleModeToggle(mode.id)}
									className={`px-3 py-2 rounded-lg text-sm transition-all ${getModeColor(mode.id, 'filter', selectedModes.includes(mode.id))}`}
								>
									{mode.label}
								</button>
							))}
						</div>
					</div>

					{/* Row 4: Distance Filter */}
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Distance Filter
						</label>

						<div className="grid grid-cols-12 gap-4">
							{/* Left: Grid Square Input */}
							<div className="col-span-3">
								<div className="text-sm text-gray-400 mb-1">Grid Square</div>
								<input
									type="text"
									value={userGrid}
									onChange={(e) => {
										const value = e.target.value.toUpperCase();
										if (value.length <= 6) setUserGrid(value);
									}}
									placeholder="KN12pq"
									maxLength="6"
									className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
								/>

								{/* Location display under grid input */}
								<div className="mt-2 min-h-6">
									{userCoords ? (
										<div className="text-xs text-green-400">
											{userCoords.latitude.toFixed(4)}°N, {userCoords.longitude.toFixed(4)}°W
										</div>
									) : userGrid.length >= 4 && userGrid.length <= 6 ? (
										<div className="text-xs text-gray-500">Calculating...</div>
									) : userGrid.length > 0 ? (
										<div className="text-xs text-yellow-500">Enter 4 or 6 characters</div>
									) : (
										<div className="text-xs text-gray-500">Enter grid square</div>
									)}
								</div>
							</div>

							{/* Middle: Distance Slider */}
							<div className="col-span-7">
								<div className="text-sm text-gray-400 mb-1">
									Max Distance: {maxDistance > 0 ? `${maxDistance} km` : 'Off'}
								</div>
								<input
									type="range"
									min="0"
									max="20000"
									step="100"
									value={maxDistance}
									onChange={(e) => setMaxDistance(parseInt(e.target.value))}
									className="w-full accent-green-500"
								/>
								<div className="flex justify-between text-xs text-gray-500 mt-1">
									<span>Off</span>
									<span>5k</span>
									<span>10k</span>
									<span>15k</span>
									<span>20k km</span>
								</div>
							</div>

							{/* Right: Distance Value Input */}
							<div className="col-span-2">
								<div className="text-sm text-gray-400 mb-1">Set Distance</div>
								<div className="flex gap-2">
									<input
										type="number"
										min="0"
										max="20000"
										step="100"
										value={maxDistance}
										onChange={(e) => setMaxDistance(parseInt(e.target.value) || 0)}
										className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm"
									/>
									<button
										onClick={() => setMaxDistance(0)}
										className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
									>
										Off
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Row 5: Spot Time Filter */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Spot Time Filter
						</label>

						<div className="grid grid-cols-12 gap-4">
							{/* Left: Quick Time Buttons */}
							<div className="col-span-3">
								<div className="text-sm text-gray-400 mb-1">Quick Settings</div>
								<div className="grid grid-cols-5 gap-2">
									{[5, 10, 15, 20, 25].map(minutes => (
										<button
											key={minutes}
											onClick={() => setMaxAgeMinutes(minutes)}
											className={`px-2 py-2 rounded text-sm ${maxAgeMinutes === minutes
												? 'bg-blue-600 text-white'
												: 'bg-gray-800 hover:bg-gray-700 text-gray-300'
												}`}
										>
											{minutes === 30 ? 'All' : `${minutes}m`}
										</button>
									))}
								</div>
							</div>

							{/* Middle: Time Slider */}
							<div className="col-span-7">
								<div className="flex justify-between items-center mb-1">
									<div className="text-sm text-gray-300">
										Max Age: {maxAgeMinutes} {maxAgeMinutes === 1 ? 'minute' : 'minutes'}
									</div>
									<span className="text-xs text-gray-500">1-30 min</span>
								</div>
								<input
									type="range"
									min="1"
									max="30"
									step="1"
									value={maxAgeMinutes}
									onChange={(e) => setMaxAgeMinutes(parseInt(e.target.value))}
									className="w-full accent-blue-500"
								/>
								<div className="text-xs text-gray-500 mt-1">
									{maxAgeMinutes >= 30 ? "Showing all available spots (API shows last 30 min)" :
										`Showing spots from last ${maxAgeMinutes} minute${maxAgeMinutes > 1 ? 's' : ''}`}
								</div>
							</div>

							{/* Right: Time Value Input */}
							<div className="col-span-2">
								<div className="text-sm text-gray-400 mb-1">Set Time</div>
								<div className="flex gap-2">
									<input
										type="number"
										min="1"
										max="30"
										step="1"
										value={maxAgeMinutes}
										onChange={(e) => {
											let value = parseInt(e.target.value) || 1;
											value = Math.max(1, Math.min(30, value));
											setMaxAgeMinutes(value);
										}}
										className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm"
									/>
									<button
										onClick={() => setMaxAgeMinutes(30)}
										className="px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-lg text-sm"
									>
										Max
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Active Filters Display */}
					{(selectedBands.length > 0 || selectedModes.length > 0 || parkReference ||
						maxAgeMinutes !== 30 || maxDistance > 0 || activatorCallsign) && (
							<div className="mt-6 pt-6 border-t border-gray-700">
								<h3 className="text-sm font-medium text-gray-300 mb-2">Active Filters:</h3>
								<div className="flex flex-wrap gap-2">
									{activatorCallsign && (
										<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${COLOR_SCHEME.filterTypes.activator}`}>
											<span className="mr-1">Activator:</span>
											<div className="flex flex-wrap gap-1">
												{activatorCallsign
													.split(',')
													.map(p => p.trim())
													.filter(p => p.length > 0)
													.map((pattern, index) => (
														<code key={index} className="font-mono bg-purple-800/30 px-1.5 py-0.5 rounded">
															{pattern}
														</code>
													))
												}
											</div>
											<button
												onClick={() => setActivatorCallsign('')}
												className="ml-2 text-purple-400 hover:text-purple-300"
												title="Clear activator filter"
											>
												<CloseIcon className="w-3 h-3" />
											</button>
										</span>
									)}
									{parkReference && (
										<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${COLOR_SCHEME.filterTypes.park}`}>
											<span className="mr-1">Park Ref:</span>
											<div className="flex flex-wrap gap-1">
												{parkReference
													.split(',')
													.map(p => p.trim())
													.filter(p => p.length > 0)
													.map((pattern, index) => (
														<code key={index} className="font-mono bg-blue-800/30 px-1.5 py-0.5 rounded">
															{pattern}
														</code>
													))
												}
											</div>
											<button
												onClick={() => setParkReference('')}
												className="ml-2 text-blue-400 hover:text-blue-300"
												title="Clear park reference filter"
											>
												<CloseIcon className="w-3 h-3" />
											</button>
										</span>
									)}
									{selectedBands.length > 0 && (
										<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${COLOR_SCHEME.filterTypes.band}`}>
											Bands: {selectedBands.map(b => b.replace('m', '')).join(', ')}
											<button
												onClick={clearAllBands}
												className="ml-2 text-indigo-400 hover:text-indigo-300"
												title="Clear all band filters"
											>
												<CloseIcon className="w-3 h-3" />
											</button>
										</span>
									)}
									{selectedModes.length > 0 && (
										<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${COLOR_SCHEME.filterTypes.mode}`}>
											Modes: {selectedModes.join(', ')}
											<button
												onClick={clearAllModes}
												className="ml-2 text-purple-400 hover:text-purple-300"
												title="Clear all mode filters"
											>
												<CloseIcon className="w-3 h-3" />
											</button>
										</span>
									)}
									{maxAgeMinutes < 30 && (
										<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${COLOR_SCHEME.filterTypes.time}`}>
											Max age: {maxAgeMinutes}m
											<button
												onClick={() => setMaxAgeMinutes(30)}
												className="ml-2 text-cyan-400 hover:text-cyan-300"
												title="Clear time filter"
											>
												<CloseIcon className="w-3 h-3" />
											</button>
										</span>
									)}
									{maxDistance > 0 && (
										<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${COLOR_SCHEME.filterTypes.distance}`}>
											Max distance: {maxDistance}km
											<button
												onClick={() => setMaxDistance(0)}
												className="ml-2 text-emerald-400 hover:text-emerald-300"
												title="Clear distance filter"
											>
												<CloseIcon className="w-3 h-3" />
											</button>
										</span>
									)}
								</div>
							</div>
						)}
				</div>

				{/* Results */}
				<div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
					<div className="px-6 py-4 border-b border-gray-700">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-xl font-semibold text-white inline mr-4">
									Spots
								</h2>
								<span className="text-sm text-gray-400">
									Showing {filteredSpots.length} of {spots.length} spots
								</span>
							</div>
							<div className="text-sm text-gray-400">
								Auto-refreshes every 60 seconds
							</div>
						</div>
					</div>

					{sortedSpots.length === 0 ? (
						<div className="p-12 text-center">
							<div className="text-gray-500 mb-4">
								<svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-lg font-medium text-gray-300 mb-2">No spots match your filters</h3>
							<p className="text-gray-500">Try adjusting your filter settings</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-800/50">
									<tr>
										{[
											{ key: 'activator', label: 'Activator' },
											{ key: 'frequency', label: 'Band / Frequency' },
											{ key: 'mode', label: 'Mode' },
											{ key: 'reference', label: 'Park' },
											{ key: 'distance', label: 'Distance' },
											{ key: 'time', label: 'Time' },
										].map(({ key, label }) => (
											<th
												key={key}
												className={`py-3 px-4 text-left text-sm cursor-pointer transition-colors ${sortConfig.key === key
													? 'text-white bg-blue-900/30'
													: 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/70'
													}`}
												onClick={() => handleSort(key)}
											>
												<div className="flex items-center justify-between">
													<span>{label}</span>
													<div className="flex items-center">
														{sortConfig.key === key ? (
															<span className="text-blue-300 ml-2 text-sm font-bold">
																{sortConfig.direction === 'asc' ? '↑' : '↓'}
															</span>
														) : (
															<span className="text-gray-500 ml-2 text-xs">
																↕
															</span>
														)}
													</div>
												</div>
											</th>
										))}
										<th className="py-3 px-4 text-left text-sm font-medium text-gray-400">
											Spotter
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-800">
									{sortedSpots.map((spot) => {
										const band = BANDS.find(b =>
											parseFloat(spot.frequency) >= b.min &&
											parseFloat(spot.frequency) <= b.max
										);
										const modeCategory = getModeCategory(spot.mode);

										return (
											<tr key={spot.spotId} className="hover:bg-gray-800/30 transition-colors">
												{/* Activator */}
												<td className="py-3 px-4">
													<div className="font-medium text-white">{spot.activator}</div>
												</td>
												{/* Frequency / Band */}
												<td className="py-3 px-4">
													<div className="flex justify-between items-center">
														{/* Left: Band */}
														{band ? (
															<div className="flex flex-col">
																<span className={`px-2 py-1 text-xs rounded-full w-fit ${getBandColor(band.id, 'badge')}`}>
																	{band.id}
																</span>
															</div>
														) : (
															<span className="text-gray-500 text-sm">—</span>
														)}

														{/* Right: Frequency */}
														<div className="font-mono text-right">
															<div className="text-blue-400">{spot.frequency} kHz</div>
														</div>
													</div>
												</td>
												{/* Mode */}
												<td className="py-3 px-4">
													<div className="flex flex-col gap-1">
														<span className={`px-3 py-1 text-xs rounded-full font-medium ${getModeColor(modeCategory, 'badge')}`}>
															{modeCategory || spot.mode}
															{modeCategory && modeCategory !== spot.mode && (
																<span className="ml-1 text-xs text-gray-400">({spot.mode})</span>
															)}
														</span>
													</div>
												</td>
												{/* Reference */}
												<td className="py-3 px-4">
													<div>
														<a href={`https://pota.app/#/park/${spot.reference}`} target="_blank" rel="noopener noreferrer">
															<div className="font-medium text-white">
																{spot.reference}
															</div>
														</a>
														<div className="text-sm text-gray-400 truncate max-w-50">
															{spot.name || parksData[spot.reference]?.name || 'Unknown Park'}
														</div>
													</div>
												</td>
												{/* Distance */}
												<td className="py-3 px-4">
													{spot.distance !== null ? (
														<div className={`font-medium ${getDistanceColor(spot.distance, band.id)}`}>
															{spot.distance.toLocaleString()} km
														</div>
													) : (
														<div className="text-gray-500 text-sm">—</div>
													)}
												</td>
												{/* Time */}
												<td className="py-3 px-4">
													<div className="text-sm">
														<div className="text-gray-300">{formatLocalTime(spot.spotTime)}</div>
														<div className="text-xs text-gray-500">
															{formatTimeForTable(spot.spotTime)}
														</div>
													</div>
												</td>
												{/* Spotter */}
												<td className="py-3 px-4">
													<div className="text-sm text-gray-400">{spot.spotter}</div>
													<div className="text-xs text-gray-500">
														{spot.comments}
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Footer */}
				<footer className="mt-8 text-center text-gray-500 text-sm">
					<p>Data from POTA API • Last update: {new Date().toLocaleTimeString()}</p>
					<p className="mt-1">
						Showing spots from last {maxAgeMinutes === 0 ? 'all time' : `${maxAgeMinutes} minutes`}
						{maxDistance > 0 && userGrid && ` • Within ${maxDistance} km of ${userGrid}`}
						{loadingParks && ' • Loading parks data...'}
					</p>
				</footer>
			</div>
		</div>
	);
};

export default POTASpots;