import React from 'react'
import styled from 'styled-components';

const board = {
  border: '1px solid #d9d9d9',
  background: '#fff',
  borderRadius: '2px',
}

const BoardHeader = {
  background: '#f5f5f5',
  border: '1px solid #d9d9d9',
  padding: '16px 24px',
  height: '56px',
}

const Kanban = () => {
  return (
    <div style={board} className="border border-gray-700 rounded-[2px] bg-white mt-4">
      <div style={BoardHeader} className="bg-[#f5f5f5] border-b border-b-[#D9D9D9] capitalize py-4 px-6 text-[#262626] font-semibold">Identified</div>
      <div> data</div>
    </div>
  );
}

export default Kanban