import React, { useState } from 'react';

interface Config {
  searchRange: {
    start: string;
    end: string;
  };
  // ... other config properties
}

const MyComponent: React.FC = () => {
  const initialConfig: Config = {
    searchRange: {
      start: '',
      end: '',
    },
    // ... other initial config values
  };

  const [config, setConfig] = useState(initialConfig);
  const [searchRange, setSearchRange] = useState(config.searchRange);

  const handleSearchRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchRange(prev => ({ ...prev, [name]: value }));
    setConfig(prev => ({ ...prev, searchRange: { ...prev.searchRange, [name]: value } }));
  };

  return (
    <div>
      {/* ... other JSX elements ... */}
      <div>
        <label htmlFor="start" className="block">Start Range:</label>
        <input
          type="text"
          id="start"
          name="start"
          value={searchRange.start}
          onChange={handleSearchRangeChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="end" className="block">End Range:</label>
        <input
          type="text"
          id="end"
          name="end"
          value={searchRange.end}
          onChange={handleSearchRangeChange}
          className="w-full p-2 border rounded"
        />
      </div>
      {/* ... rest of JSX ... */}
    </div>
  );
};

export default MyComponent;

