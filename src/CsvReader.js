import React, { useState } from "react";
import Papa from "papaparse";

const colorFace = "#FFE5B4";
const colorEars = "orange";
const colorEyes = "black";
const colorNose = "brown";
const colorMouth = "red";

function calculateQuartile(data, quartile) {
  const sorted = [...data].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * quartile;
  const base = Math.floor(pos);
  const rest = pos - base;

  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

function calculateAverage(data) {
  const sum = data.reduce((a, b) => a + b, 0);
  return sum / data.length;
}

function calculateMedian(data) {
  return calculateQuartile(data, 0.5);
}

function calculateSum(data) {
  return data.reduce((a, b) => a + b, 0);
}

function calculateMode(data) {
  const frequency = {};
  let maxFreq = 0;
  let mode = [];

  data.forEach((value) => {
    frequency[value] = (frequency[value] || 0) + 1;
    if (frequency[value] > maxFreq) {
      maxFreq = frequency[value];
    }
  });

  for (const [key, freq] of Object.entries(frequency)) {
    if (freq === maxFreq) {
      mode.push(Number(key));
    }
  }

  return mode.length === 1 ? mode[0] : mode.join(", ");
}

function calculateVariance(data, mean) {
  return (
    data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    data.length
  );
}

function calculateStandardDeviation(variance) {
  return Math.sqrt(variance);
}

function calculateRange(data) {
  return Math.max(...data) - Math.min(...data);
}

function getShapeByRange(value, Q1, Q2, Q3) {
  // Oblicz różnice między wartością a kwantylami
  const distances = [
    { shape: "circle", distance: Math.abs(value - Q1) },
    { shape: "square", distance: Math.abs(value - Q2) },
    { shape: "triangle", distance: Math.abs(value - Q3) },
  ];

  // Znajdź kwantyl z najmniejszą różnicą
  const closest = distances.reduce((prev, current) =>
    prev.distance < current.distance ? prev : current
  );

  return closest.shape;
}

function Shape({ type, size, x, y, fill }) {
  switch (type) {
    case "square":
      return (
        <rect
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          fill={fill}
        />
      );
    case "circle":
      return <circle cx={x} cy={y} r={size / 2} fill={fill} />;
    case "triangle":
      return (
        <polygon
          points={`${x},${y - size / 2} ${x - size / 2},${y + size / 2} ${
            x + size / 2
          },${y + size / 2}`}
          fill={fill}
        />
      );
    default:
      return null;
  }
}

function ChernoffFace({ data }) {
  const attributes = Object.keys(data[0]);
  let faceShape = "square";

  return (
    <svg width="200" height="200" viewBox="0 0 100 100">
      {attributes.map((attribute, index) => {
        const columnData = data
          .map((row) => row[attribute])
          .filter((value) => !isNaN(value));

        const Q1 = calculateQuartile(columnData, 0.25);
        const Q2 = calculateQuartile(columnData, 0.5);
        const Q3 = calculateQuartile(columnData, 0.75);
        const average = calculateAverage(columnData);

        const shapeType = getShapeByRange(average, Q1, Q2, Q3);
        if (index === 0) {
          faceShape = shapeType;
          return (
            <Shape type={shapeType} size={40} x={50} y={50} fill={colorFace} />
          );
        } else if (index === 1) {
          return (
            <>
              <Shape
                type={shapeType}
                size={10}
                x={faceShape === "triangle" ? 33 : 25}
                y={50}
                fill={colorEars}
              />
              <Shape
                type={shapeType}
                size={10}
                x={faceShape === "triangle" ? 67 : 75}
                y={50}
                fill={colorEars}
              />
            </>
          );
        } else if (index === 2) {
          return (
            <>
              <Shape type={shapeType} size={6} x={45} y={45} fill={colorEyes} />
              <Shape type={shapeType} size={6} x={55} y={45} fill={colorEyes} />
            </>
          );
        } else if (index === 3) {
          return (
            <Shape type={shapeType} size={6} x={50} y={53} fill={colorNose} />
          );
        } else if (index === 4) {
          return (
            <Shape type={shapeType} size={8} x={50} y={63} fill={colorMouth} />
          );
        }
      })}
    </svg>
  );
}

const renderShapes = (shapeType, index) => {
  const shapes = [];

  shapes.push(
    <Shape type={shapeType} size={40} x={50} y={50} fill={colorFace} />
  );

  if (index >= 1) {
    shapes.push(
      <Shape
        type={shapeType}
        size={10}
        x={shapeType === "triangle" ? 33 : 25}
        y={50}
        fill={colorEars}
      />,
      <Shape
        type={shapeType}
        size={10}
        x={shapeType === "triangle" ? 67 : 75}
        y={50}
        fill={colorEars}
      />
    );
  }
  if (index >= 2) {
    shapes.push(
      <Shape type={shapeType} size={6} x={45} y={45} fill={colorEyes} />,
      <Shape type={shapeType} size={6} x={55} y={45} fill={colorEyes} />
    );
  }
  if (index >= 3) {
    shapes.push(
      <Shape type={shapeType} size={6} x={50} y={53} fill={colorNose} />
    );
  }
  if (index >= 4) {
    shapes.push(
      <Shape type={shapeType} size={8} x={50} y={63} fill={colorMouth} />
    );
  }

  return shapes;
};

function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav style={{ marginBottom: "20px" }}>
      <button
        style={{
          padding: "10px 20px",
          marginRight: "10px",
          background: activeTab === "data" ? "#ccc" : "#f0f0f0",
        }}
        onClick={() => setActiveTab("data")}
      >
        Data
      </button>
      <button
        style={{
          padding: "10px 20px",
          marginRight: "10px",
          background: activeTab === "statistics" ? "#ccc" : "#f0f0f0",
        }}
        onClick={() => setActiveTab("statistics")}
      >
        Statistics
      </button>
      <button
        style={{
          padding: "10px 20px",
          background: activeTab === "faces" ? "#ccc" : "#f0f0f0",
        }}
        onClick={() => setActiveTab("faces")}
      >
        Chernoff Faces
      </button>
    </nav>
  );
}

function CsvReader() {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [csvLoaded, setCsvLoaded] = useState(false);
  const [statistics, setStatistics] = useState({});
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [activeTab, setActiveTab] = useState("data");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const parsedData = result.data.map((row) =>
            Object.fromEntries(
              Object.entries(row).map(([key, value]) => [
                key,
                parseFloat(value) || 0,
              ])
            )
          );

          const [firstRow] = parsedData;
          const columnHeaders = Object.keys(firstRow);
          if (columnHeaders.length !== 5) {
            handleClear();
            alert("Application only for CSV files with 5 columns");
            return;
          }
          setHeaders(columnHeaders);
          setData(parsedData);
          setCsvLoaded(true);

          const stats = columnHeaders.reduce((acc, header) => {
            const columnData = parsedData
              .map((row) => row[header])
              .filter((value) => !isNaN(value));
            const mean = calculateAverage(columnData);
            const variance = calculateVariance(columnData, mean);
            acc[header] = {
              Q1: calculateQuartile(columnData, 0.25),
              Q2: calculateMedian(columnData),
              Q3: calculateQuartile(columnData, 0.75),
              mean: mean,
              min: Math.min(...columnData),
              max: Math.max(...columnData),
              range: calculateRange(columnData),
              mode: calculateMode(columnData),
              standardDeviation: calculateStandardDeviation(variance),
              variance: variance,
              sum: calculateSum(columnData),
            };
            return acc;
          }, {});

          setStatistics(stats);
        },
      });
    }
  };

  const handleClear = () => {
    setHeaders([]);
    setData([]);
    setCsvLoaded(false);
    setStatistics({});
    setSelectedColumn(null);
    setActiveTab("data");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>CSV File Reader with Chernoff Faces</h1>
      {!csvLoaded && (
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ marginBottom: "10px" }}
        />
      )}
      {csvLoaded && (
        <>
          <button onClick={handleClear} style={{ marginBottom: "10px" }}>
            Clear CSV
          </button>
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === "data" && (
            <div>
              <h2>Data:</h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <table
                  border="1"
                  cellPadding="5"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr>
                      <th>Lp.</th>
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          style={{
                            cursor: "pointer",
                            color: selectedColumn === header ? "blue" : "black",
                          }}
                          onClick={() => setSelectedColumn(header)}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td>{rowIndex + 1 + "."}</td>
                        {headers.map((header, index) => (
                          <td
                            style={{
                              cursor: "pointer",
                              color:
                                selectedColumn === header ? "blue" : "black",
                            }}
                            key={index}
                            onClick={() => setSelectedColumn(header)}
                          >
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedColumn && (
                  <div
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <h3>Statistics for column: {selectedColumn}</h3>
                    <table
                      border="1"
                      cellPadding="5"
                      style={{ borderCollapse: "collapse", marginTop: "10px" }}
                    >
                      <thead>
                        <tr>
                          <th>Statistic</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Min</td>
                          <td>{statistics[selectedColumn].min.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Max</td>
                          <td>{statistics[selectedColumn].max.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Range</td>
                          <td>{statistics[selectedColumn].range.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Mean</td>
                          <td>{statistics[selectedColumn].mean.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Mode</td>
                          <td>{statistics[selectedColumn].mode}</td>
                        </tr>
                        <tr>
                          <td>Q1 (25%)</td>
                          <td>{statistics[selectedColumn].Q1.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Median (Q2)</td>
                          <td>{statistics[selectedColumn].Q2.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Q3 (75%)</td>
                          <td>{statistics[selectedColumn].Q3.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Variance</td>
                          <td>
                            {statistics[selectedColumn].variance.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td>Standard Deviation</td>
                          <td>
                            {statistics[
                              selectedColumn
                            ].standardDeviation.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td>Sum</td>
                          <td>
                            {statistics[
                              selectedColumn
                            ].sum.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === "statistics" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h2>Statistics:</h2>
              <table
                border="1"
                cellPadding="5"
                style={{ borderCollapse: "collapse", marginTop: "10px" }}
              >
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Range</th>
                    <th>Mean</th>
                    <th>Mode</th>
                    <th>Q1 (25%)</th>
                    <th>Median (Q2)</th>
                    <th>Q3 (75%)</th>
                    <th>Variance</th>
                    <th>Standard Deviation</th>
                    <th>Sum</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(statistics).map(([header, stats], index) => (
                    <tr key={index}>
                      <td>{header}</td>
                      <td>{stats.min.toFixed(2)}</td>
                      <td>{stats.max.toFixed(2)}</td>
                      <td>{stats.range.toFixed(2)}</td>
                      <td>{stats.mean.toFixed(2)}</td>
                      <td>{stats.mode}</td>
                      <td>{stats.Q1.toFixed(2)}</td>
                      <td>{stats.Q2.toFixed(2)}</td>
                      <td>{stats.Q3.toFixed(2)}</td>
                      <td>{stats.variance.toFixed(2)}</td>
                      <td>{stats.standardDeviation.toFixed(2)}</td>
                      <td>{stats.sum.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "faces" && (
            <div>
              <h2>Chernoff Faces:</h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <table
                  border="1"
                  cellPadding="5"
                  style={{ borderCollapse: "collapse", marginBottom: "20px" }}
                >
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Q1 (25%)</th>
                      <th>Q2 (50%)</th>
                      <th>Q3 (75%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statistics).map(
                      ([header, stats], index) => (
                        <tr key={index}>
                          <td>{header}</td>
                          <td>
                            <svg width="200" height="200" viewBox="0 0 100 100">
                              {renderShapes("circle", index)}
                            </svg>
                          </td>
                          <td>
                            <svg width="200" height="200" viewBox="0 0 100 100">
                              {renderShapes("square", index)}
                            </svg>
                          </td>
                          <td>
                            <svg width="200" height="200" viewBox="0 0 100 100">
                              {renderShapes("triangle", index)}
                            </svg>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <h2>General Chernoff Face:</h2>
                  <ChernoffFace data={data} attribute={headers[0]} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CsvReader;
