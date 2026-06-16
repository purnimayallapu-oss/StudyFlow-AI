import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash, 
  ArrowUp, 
  ArrowDown, 
  Columns, 
  Edit, 
  Check, 
  FileText, 
  ListTodo, 
  Calendar, 
  Globe, 
  Layout, 
  Save, 
  X,
  Sliders,
  Sparkles,
  ClipboardList
} from "lucide-react";
import { CustomTable, CustomColumn, CustomRow, CustomColumnType, CustomChecklistItem } from "../types";

export default function CustomStudyTables() {
  const [tables, setTables] = useState<CustomTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [newTableName, setNewTableName] = useState("");
  
  // Create column state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState<CustomColumnType>("Text");

  // Edit Row details state
  const [activeRowDetails, setActiveRowDetails] = useState<{ tableId: string, rowId: string } | null>(null);
  const [editChecklistItemText, setEditChecklistItemText] = useState("");

  // Load from local storage on mount
  useEffect(() => {
    const cachedTables = localStorage.getItem("studyflow_custom_tables");
    if (cachedTables) {
      try {
        const parsed = JSON.parse(cachedTables);
        if (parsed && parsed.length > 0) {
          setTables(parsed);
          setSelectedTableId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Failed to parse custom tables", e);
      }
    }
    
    // Seed default Placement Preparation Table
    const defaultTable: CustomTable = {
      id: "table_placement_prep",
      name: "Placement Preparation Table",
      columns: [
        { id: "col_task", name: "Task Name", type: "Text" },
        { id: "col_status", name: "Status", type: "Status" },
        { id: "col_priority", name: "Priority", type: "Priority" },
        { id: "col_progress", name: "Progress", type: "Progress" },
        { id: "col_deadline", name: "Target Date", type: "Date" }
      ],
      rows: [
        {
          id: "row_1",
          cells: {
            "col_task": "Perfect Resume Draft",
            "col_status": "Completed",
            "col_priority": "High",
            "col_progress": 100,
            "col_deadline": "2026-06-20"
          },
          checklist: [
            { id: "chk_1", text: "Match keywords to ATS templates", completed: true },
            { id: "chk_2", text: "Export clean LaTeX single-page PDF", completed: true }
          ],
          deadline: "2026-06-20",
          notes: "Focus on adding quantifiable metrics for personal engineering projects."
        },
        {
          id: "row_2",
          cells: {
            "col_task": "Master Quant Aptitude",
            "col_status": "In Progress",
            "col_priority": "High",
            "col_progress": 45,
            "col_deadline": "2026-06-22"
          },
          checklist: [
            { id: "chk_3", text: "Review permutations & combinations formulas", completed: true },
            { id: "chk_4", text: "Solve 20 high-difficulty clock puzzles", completed: false }
          ],
          deadline: "2026-06-22",
          notes: "Daily practice of probability sums must continue."
        },
        {
          id: "row_3",
          cells: {
            "col_task": "DSA Trees & Graphs",
            "col_status": "Pending",
            "col_priority": "Medium",
            "col_progress": 15,
            "col_deadline": "2026-06-25"
          },
          checklist: [
            { id: "chk_5", text: "In-order successor tracing manually", completed: false },
            { id: "chk_6", text: "Optimize Dijkstra binary heap complexity", completed: false }
          ],
          deadline: "2026-06-25",
          notes: "Need revision of graph components."
        }
      ]
    };
    
    setTables([defaultTable]);
    setSelectedTableId(defaultTable.id);
    localStorage.setItem("studyflow_custom_tables", JSON.stringify([defaultTable]));
  }, []);

  // Sync to local storage
  const saveTables = (updatedTables: CustomTable[]) => {
    setTables(updatedTables);
    localStorage.setItem("studyflow_custom_tables", JSON.stringify(updatedTables));
  };

  const activeTable = tables.find(t => t.id === selectedTableId);

  // Table Management Actions
  const handleCreateTable = () => {
    if (!newTableName.trim()) return;
    const newId = "table_" + Date.now();
    const newTable: CustomTable = {
      id: newId,
      name: newTableName.trim(),
      columns: [
        { id: "col_title_" + Date.now(), name: "Item / Task Name", type: "Text" },
        { id: "col_status_" + Date.now(), name: "Status", type: "Status" }
      ],
      rows: [
        {
          id: "row_init_" + Date.now(),
          cells: {},
          checklist: [],
          deadline: "",
          notes: ""
        }
      ]
    };
    const updated = [...tables, newTable];
    saveTables(updated);
    setSelectedTableId(newId);
    setNewTableName("");
  };

  const handleDeleteTable = (tableId: string) => {
    if (tables.length <= 1) {
      alert("At least one custom table must exist in your workspace.");
      return;
    }
    const filtered = tables.filter(t => t.id !== tableId);
    saveTables(filtered);
    setSelectedTableId(filtered[0].id);
  };

  // Column Actions
  const handleAddColumn = () => {
    if (!newColName.trim() || !activeTable) return;
    const colId = "col_" + Date.now();
    const newCol: CustomColumn = {
      id: colId,
      name: newColName.trim(),
      type: newColType
    };
    
    const updated = tables.map(t => {
      if (t.id === activeTable.id) {
        return {
          ...t,
          columns: [...t.columns, newCol],
          // Seed cells empty or default
          rows: t.rows.map(r => ({
            ...r,
            cells: {
              ...r.cells,
              [colId]: newColType === "Progress" ? 0 : newColType === "Checkbox" ? false : ""
            }
          }))
        };
      }
      return t;
    });

    saveTables(updated);
    setNewColName("");
    setIsAddingColumn(false);
  };

  const handleDeleteColumn = (colId: string) => {
    if (!activeTable) return;
    if (activeTable.columns.length <= 1) {
      alert("A table must contain at least one column.");
      return;
    }
    const updated = tables.map(t => {
      if (t.id === activeTable.id) {
        const filteredCols = t.columns.filter(c => c.id !== colId);
        const cleanedRows = t.rows.map(r => {
          const cellsCopy = { ...r.cells };
          delete cellsCopy[colId];
          return { ...r, cells: cellsCopy };
        });
        return {
          ...t,
          columns: filteredCols,
          rows: cleanedRows
        };
      }
      return t;
    });
    saveTables(updated);
  };

  // Row Actions: Adding, deleting, sorting
  const handleAddRow = () => {
    if (!activeTable) return;
    const newRowId = "row_" + Date.now();
    const defaultCells: Record<string, any> = {};
    activeTable.columns.forEach(col => {
      defaultCells[col.id] = col.type === "Progress" ? 0 : col.type === "Checkbox" ? false : "";
    });

    const newRow: CustomRow = {
      id: newRowId,
      cells: defaultCells,
      checklist: [],
      deadline: "",
      notes: ""
    };

    const updated = tables.map(t => {
      if (t.id === activeTable.id) {
        return {
          ...t,
          rows: [...t.rows, newRow]
        };
      }
      return t;
    });
    saveTables(updated);
  };

  const handleDeleteRow = (rowId: string) => {
    if (!activeTable) return;
    const updated = tables.map(t => {
      if (t.id === activeTable.id) {
        return {
          ...t,
          rows: t.rows.filter(r => r.id !== rowId)
        };
      }
      return t;
    });
    saveTables(updated);
    if (activeRowDetails?.rowId === rowId) {
      setActiveRowDetails(null);
    }
  };

  // Moving rows (support manual row sorting as requested)
  const handleMoveRow = (index: number, direction: "UP" | "DOWN") => {
    if (!activeTable) return;
    const rowsCopy = [...activeTable.rows];
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= rowsCopy.length) return;

    // Swap
    const temp = rowsCopy[index];
    rowsCopy[index] = rowsCopy[targetIdx];
    rowsCopy[targetIdx] = temp;

    const updated = tables.map(t => {
      if (t.id === activeTable.id) {
        return {
          ...t,
          rows: rowsCopy
        };
      }
      return t;
    });
    saveTables(updated);
  };

  // Cell Value editing
  const handleCellChange = (rowId: string, colId: string, val: any) => {
    if (!activeTable) return;
    const updated = tables.map(t => {
      if (t.id === activeTable.id) {
        return {
          ...t,
          rows: t.rows.map(r => r.id === rowId ? {
            ...r,
            cells: {
              ...r.cells,
              [colId]: val
            }
          } : r)
        };
      }
      return t;
    });
    saveTables(updated);
  };

  // Row properties: checklist, deadline, notes inside Side Drawer
  const activeDetailRow = activeTable?.rows.find(r => r.id === activeRowDetails?.rowId);

  const handleUpdateRowDetailsProperty = (field: "notes" | "deadline", value: string) => {
    if (!activeTable || !activeDetailRow) return;
    const updated = tables.map(t => {
      if (t.id === activeTable.id) {
        return {
          ...t,
          rows: t.rows.map(r => r.id === activeDetailRow.id ? { ...r, [field]: value } : r)
        };
      }
      return t;
    });
    saveTables(updated);
  };

  const handleAddChecklistItem = () => {
    if (!activeTable || !activeDetailRow || !editChecklistItemText.trim()) return;
    const newItem: CustomChecklistItem = {
      id: "item_" + Date.now(),
      text: editChecklistItemText.trim(),
      completed: false
    };
    const updated = tables.map(t => {
      if (t.id === activeTable.id) {
        return {
          ...t,
          rows: t.rows.map(r => r.id === activeDetailRow.id ? {
            ...r,
            checklist: [...r.checklist, newItem]
          } : r)
        };
      }
      return t;
    });
    saveTables(updated);
    setEditChecklistItemText("");
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!activeTable || !activeDetailRow) return;
    const updated = tables.map(t => {
      if (t.id === activeTable.id) {
        return {
          ...t,
          rows: t.rows.map(r => r.id === activeDetailRow.id ? {
            ...r,
            checklist: r.checklist.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item)
          } : r)
        };
      }
      return t;
    });
    saveTables(updated);
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    if (!activeTable || !activeDetailRow) return;
    const updated = tables.map(t => {
      if (t.id === activeTable.id) {
        return {
          ...t,
          rows: t.rows.map(r => r.id === activeDetailRow.id ? {
            ...r,
            checklist: r.checklist.filter(item => item.id !== itemId)
          } : r)
        };
      }
      return t;
    });
    saveTables(updated);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. TABLE SWITCHER & CONTROLS */}
      <section className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl backdrop-blur-sm shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Custom Interactive Notebook Databases</span>
          </div>
          <h2 className="text-lg font-black text-white">Non-Hierarchical Study Desks</h2>
          <p className="text-xs text-slate-400 font-light">Build, structure, and order placement matrices in spreadsheet frames</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Active Selector */}
          <div className="flex items-center bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850 gap-2 shrink-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">My Tables:</span>
            <select
              value={selectedTableId}
              onChange={(e) => {
                setSelectedTableId(e.target.value);
                setActiveRowDetails(null);
              }}
              className="bg-transparent text-xs text-slate-200 outline-none border-none py-0.5 cursor-pointer font-bold w-48"
            >
              {tables.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-950 text-slate-200">{t.name}</option>
              ))}
            </select>
          </div>

          {/* Delete Option if several exist */}
          {tables.length > 1 && (
            <button
              onClick={() => handleDeleteTable(selectedTableId)}
              className="p-2.5 bg-red-650/15 hover:bg-red-600/25 border border-red-500/20 text-red-400 rounded-xl transition-all cursor-pointer"
              title="Delete current active spreadsheet"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* 2. SPREADSHEET CANVAS AREA */}
      {activeTable ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* DATABASE GRID COLLAPSE PANEL (3/4 Screen) */}
          <div className={`${activeDetailRow ? "lg:col-span-3" : "lg:col-span-4"} bg-slate-900/60 border border-slate-800 rounded-3xl p-5 backdrop-blur-sm shadow-xl space-y-4 overflow-hidden transition-all duration-300`}>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-mono font-bold uppercase">DATABASE FRAME</span>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">{activeTable.name}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Add column triggers */}
                {isAddingColumn ? (
                  <div className="flex items-center bg-slate-950 border border-slate-850 p-1.5 rounded-xl gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Col Name..."
                      value={newColName}
                      onChange={(e) => setNewColName(e.target.value)}
                      className="bg-transparent border-none text-slate-200 text-xs px-1.5 outline-none font-bold w-24 placeholder:text-slate-650"
                    />
                    <select
                      value={newColType}
                      onChange={(e) => setNewColType(e.target.value as CustomColumnType)}
                      className="bg-slate-900 text-slate-300 border-none outline-none font-semibold text-[10px] px-1 cursor-pointer"
                    >
                      <option value="Text">Text</option>
                      <option value="Checkbox">Checkbox</option>
                      <option value="Number">Number</option>
                      <option value="Date">Date</option>
                      <option value="Status">Status</option>
                      <option value="Priority">Priority</option>
                      <option value="Progress">Progress</option>
                    </select>
                    <button
                      onClick={handleAddColumn}
                      className="p-1 bg-emerald-600 rounded text-white cursor-pointer"
                      title="Confirm column addition"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsAddingColumn(false)}
                      className="p-1 bg-slate-800 rounded text-slate-300 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingColumn(true)}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl text-[11px] text-slate-300 cursor-pointer transition-all flex items-center gap-1 font-bold whitespace-nowrap"
                  >
                    <Columns className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Add Attribute Column</span>
                  </button>
                )}

                <button
                  onClick={handleAddRow}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[11px] text-white cursor-pointer transition-all flex items-center gap-1 font-bold whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Database Row</span>
                </button>
              </div>
            </div>

            {/* INTERACTIVE EXCEL GRID */}
            <div className="overflow-x-auto rounded-xl border border-slate-850">
              <table className="w-full text-left border-collapse text-xs">
                
                {/* Dynamic Table Header */}
                <thead className="bg-slate-950 text-slate-400 uppercase text-[9px] tracking-wider font-extrabold border-b border-slate-805/60 select-none">
                  <tr>
                    <th className="py-3 px-2 w-10 text-center">Row</th>
                    <th className="py-3 px-2 w-20 text-center font-mono">Sort</th>
                    
                    {activeTable.columns.map(col => (
                      <th key={col.id} className="py-3 px-3 min-w-[140px] relative group font-sans text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{col.name}</span>
                          <span className="text-[7.5px] lowercase font-mono bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-indigo-400 leading-none mr-2">
                            {col.type}
                          </span>
                        </div>
                        {/* Col deleter option */}
                        <button
                          onClick={() => {
                            if (confirm(`Delete column "${col.name}" and all cellular logs inside it?`)) {
                              handleDeleteColumn(col.id);
                            }
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:block p-1 bg-red-950 border border-red-500/20 text-red-400 rounded cursor-pointer"
                          title="Flick attribute away"
                        >
                          <Trash className="w-2.5 h-2.5" />
                        </button>
                      </th>
                    ))}
                    
                    <th className="py-3 px-3 w-16 text-center">Extras</th>
                    <th className="py-3 px-2 w-10 text-center">Delete</th>
                  </tr>
                </thead>

                {/* Spreadsheet Rows */}
                <tbody className="divide-y divide-slate-850 bg-slate-900/10 font-medium">
                  {activeTable.rows.length === 0 ? (
                    <tr>
                      <td colSpan={activeTable.columns.length + 4} className="text-center py-10 text-slate-500">
                        Spreadsheet empty. Click "Add Database Row" to inject elements!
                      </td>
                    </tr>
                  ) : (
                    activeTable.rows.map((row, rIdx) => {
                      const isFocused = activeRowDetails?.rowId === row.id;
                      return (
                        <tr 
                          key={row.id}
                          className={`hover:bg-slate-850/35 transition-all ${isFocused ? "bg-indigo-600/5" : ""}`}
                        >
                          {/* Indicator index */}
                          <td className="py-2.5 px-2 text-center font-mono text-slate-550 text-[10px]">
                            {rIdx + 1}
                          </td>

                          {/* Sorting buttons */}
                          <td className="py-2 px-2">
                            <div className="flex justify-center gap-1">
                              <button
                                disabled={rIdx === 0}
                                onClick={() => handleMoveRow(rIdx, "UP")}
                                className="p-1 hover:bg-slate-800 disabled:opacity-20 rounded text-slate-500 hover:text-indigo-400 cursor-pointer disabled:cursor-not-allowed"
                                title="Move Row Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                disabled={rIdx === activeTable.rows.length - 1}
                                onClick={() => handleMoveRow(rIdx, "DOWN")}
                                className="p-1 hover:bg-slate-800 disabled:opacity-20 rounded text-slate-500 hover:text-indigo-400 cursor-pointer disabled:cursor-not-allowed"
                                title="Move Row Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* Dynamic Cells */}
                          {activeTable.columns.map(col => {
                            const val = row.cells[col.id] !== undefined ? row.cells[col.id] : "";
                            
                            return (
                              <td key={col.id} className="py-1 px-2">
                                {col.type === "Checkbox" ? (
                                  <div className="flex items-center justify-center py-1">
                                    <input
                                      type="checkbox"
                                      checked={!!val}
                                      onChange={(e) => handleCellChange(row.id, col.id, e.target.checked)}
                                      className="w-4.5 h-4.5 cursor-pointer accent-indigo-500 rounded border border-slate-700 bg-slate-950 focus:ring-0 outline-none"
                                    />
                                  </div>
                                ) : col.type === "Number" ? (
                                  <input
                                    type="number"
                                    value={val}
                                    onChange={(e) => handleCellChange(row.id, col.id, Number(e.target.value))}
                                    className="w-full bg-transparent border-none outline-none font-mono text-xs text-slate-200 px-2 py-1.5 focus:bg-slate-950 rounded"
                                    placeholder="0"
                                  />
                                ) : col.type === "Date" ? (
                                  <input
                                    type="date"
                                    value={val}
                                    onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-slate-200 font-mono text-[10.5px] px-1 py-1 cursor-pointer focus:bg-slate-950 rounded hover:text-white"
                                  />
                                ) : col.type === "Status" ? (
                                  <select
                                    value={val}
                                    onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                                    className={`w-full bg-transparent border-none outline-none text-[10.5px] font-bold px-1.5 py-1 focus:bg-slate-950 rounded cursor-pointer ${
                                      val === "Completed" ? "text-emerald-400" :
                                      val === "In Progress" ? "text-sky-400" :
                                      val === "Blocked" ? "text-red-400" :
                                      "text-slate-450"
                                    }`}
                                  >
                                    <option value="" className="bg-slate-950 text-slate-500">None</option>
                                    <option value="Pending" className="bg-slate-950 text-slate-400">Pending</option>
                                    <option value="In Progress" className="bg-slate-950 text-sky-450">In Progress</option>
                                    <option value="Completed" className="bg-slate-950 text-emerald-450">Completed</option>
                                    <option value="Blocked" className="bg-slate-950 text-red-450">Blocked</option>
                                  </select>
                                ) : col.type === "Priority" ? (
                                  <select
                                    value={val}
                                    onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                                    className={`w-full bg-transparent border-none outline-none text-[10.5px] font-bold px-1.5 py-1 focus:bg-slate-950 rounded cursor-pointer ${
                                      val === "High" || val === "Urgent" ? "text-red-400" :
                                      val === "Medium" ? "text-amber-400" :
                                      "text-indigo-400"
                                    }`}
                                  >
                                    <option value="" className="bg-slate-950 text-slate-500 font-sans">None</option>
                                    <option value="Low" className="bg-slate-950 text-indigo-400 font-sans">Low</option>
                                    <option value="Medium" className="bg-slate-950 text-amber-400 font-sans">Medium</option>
                                    <option value="High" className="bg-slate-950 text-red-350 font-sans">High</option>
                                    <option value="Urgent" className="bg-slate-950 text-red-500 font-sans font-black">Urgent</option>
                                  </select>
                                ) : col.type === "Progress" ? (
                                  <div className="flex items-center gap-2 px-1">
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={val || 0}
                                      onChange={(e) => handleCellChange(row.id, col.id, parseInt(e.target.value))}
                                      className="w-16 accent-indigo-500 bg-slate-950 h-1 cursor-pointer focus:ring-0 outline-none rounded"
                                    />
                                    <span className="font-mono text-[9px] text-slate-400 w-10 text-right">{val || 0}%</span>
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    value={val}
                                    onChange={(e) => handleCellChange(row.id, col.id, e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-slate-100 text-xs px-2 py-1.5 focus:bg-slate-950 rounded placeholder:text-slate-700"
                                    placeholder="Type anything..."
                                  />
                                )}
                              </td>
                            );
                          })}

                          {/* Extras Sidebar Drawer Trigger (Notes, checklist and deadline) */}
                          <td className="py-2 px-1 text-center font-sans">
                            <button
                              onClick={() => {
                                if (isFocused) {
                                  setActiveRowDetails(null);
                                } else {
                                  setActiveRowDetails({ tableId: activeTable.id, rowId: row.id });
                                }
                              }}
                              className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                isFocused 
                                  ? "bg-indigo-600 text-white border-indigo-505" 
                                  : "bg-slate-950/70 border-slate-850 text-slate-400 hover:text-white"
                              }`}
                              title="Organize row notes, calendars and checklists"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                            </button>
                          </td>

                          {/* Clear row */}
                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => {
                                if (confirm("Delete this rows completely from this custom database frame?")) {
                                  handleDeleteRow(row.id);
                                }
                              }}
                              className="p-1 hover:bg-red-500/10 rounded text-slate-550 hover:text-red-400 transition-all cursor-pointer"
                              title="Delete Row"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* CREATE NEW TABLE FORM CONTROLS IN SHORTER EXPANDER */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-401 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Initialize Another Custom study Dashboard</span>
              </h4>
              <div className="flex gap-2 text-xs">
                <input
                  type="text"
                  placeholder="e.g. GATE 2027 Syllabus Checklist..."
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-3 py-1.5 flex-1 outline-none focus:border-indigo-505 text-[11px] font-bold"
                />
                <button
                  onClick={handleCreateTable}
                  className="px-4 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-indigo-400 hover:text-indigo-300 font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Table</span>
                </button>
              </div>
            </div>

          </div>

          {/* ACTIVE ROW DRAWER EXPANDER (1/4 Screen) */}
          {activeDetailRow && (
            <div className="lg:col-span-1 bg-slate-900 border border-indigo-500/20 rounded-3xl p-5 shadow-2xl space-y-5 text-slate-200 anime-fade-in text-xs flex flex-col justify-between max-h-[80vh] overflow-y-auto">
              
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">EXTRAS COLLAPSE DRAWER</span>
                    <h3 className="text-xs font-black text-slate-105 pr-2 uppercase truncate max-w-[170px]">
                      {activeDetailRow.cells[activeTable.columns[0]?.id] || "No Task Title Defined"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveRowDetails(null)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Deadline Picker */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">📅 Row Deadline</label>
                  <input
                    type="date"
                    value={activeDetailRow.deadline}
                    onChange={(e) => handleUpdateRowDetailsProperty("deadline", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 outline-none focus:border-indigo-505 font-mono text-xs text-slate-205"
                  />
                </div>

                {/* Notes Canvas */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">✍️ Notes & Definitions</label>
                  <textarea
                    rows={4}
                    value={activeDetailRow.notes}
                    onChange={(e) => handleUpdateRowDetailsProperty("notes", e.target.value)}
                    placeholder="Type markdown, reference summaries, formulas, or reminders for this row..."
                    className="w-full bg-slate-950 border border-slate-850 text-slate-200 placeholder:text-slate-650 rounded-xl px-3 py-2 outline-none focus:border-indigo-505 text-xs font-normal leading-relaxed resize-none"
                  />
                </div>

                {/* Checklist widget */}
                <div className="space-y-3.5 pt-2 border-t border-slate-850/60">
                  <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 leading-none">
                    <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Sub-Task Checklist</span>
                  </label>

                  {/* Add checklist input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add step..."
                      value={editChecklistItemText}
                      onChange={(e) => setEditChecklistItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddChecklistItem();
                      }}
                      className="bg-slate-955 border border-slate-850 text-slate-200 placeholder:text-slate-650 rounded-lg px-3 py-1 flex-1 outline-none focus:border-indigo-505 text-[11px]"
                    />
                    <button
                      onClick={handleAddChecklistItem}
                      className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-bold transition-all text-[11px] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {/* Checklist List */}
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5">
                    {activeDetailRow.checklist.length === 0 ? (
                      <p className="text-[10.5px] text-slate-500 italic text-center py-2">No sub-tasks. Type one above!</p>
                    ) : (
                      activeDetailRow.checklist.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-[11px] bg-slate-950/70 p-2 rounded-lg border border-slate-850/50">
                          <div className="flex items-center gap-2 text-slate-200">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => handleToggleChecklistItem(item.id)}
                              className="w-3.5 h-3.5 accent-indigo-500 rounded border-slate-705 cursor-pointer outline-none"
                            />
                            <span className={item.completed ? "line-through text-slate-500 text-[10px]" : "font-medium"}>
                              {item.text}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteChecklistItem(item.id)}
                            className="p-0.5 hover:bg-slate-800 rounded text-slate-00 hover:text-red-400 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              <div className="pt-3 border-t border-slate-850 text-center">
                <button
                  onClick={() => setActiveRowDetails(null)}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-850 font-bold rounded-xl text-slate-350 hover:text-slate-100 transition-all border border-slate-850 cursor-pointer"
                >
                  Save & Hide Drawer
                </button>
              </div>

            </div>
          )}

        </div>
      ) : (
        <div className="bg-slate-900/60 p-12 rounded-3xl border border-slate-800 text-center max-w-lg mx-auto">
          <Sliders className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="font-bold text-slate-300">Custom Spreadsheets Cleared</h4>
          <p className="text-xs text-slate-500 mt-1">Please re-verify or reload the applet's standard state matrices.</p>
        </div>
      )}

    </div>
  );
}
