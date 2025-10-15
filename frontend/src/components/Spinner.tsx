import React from 'react'

const Spinner = ({size,color}:{size:number,color:'blue'|'violet'|'white'|'black'}) => {
  return (
    <div style={{height:size,width:size,color:color=='black'? '#000': color=='violet'?'#9077f3ff' :color=='blue'? '#3a7ae9ff':'#fff' }} className={`animate-spin rounded-full border-t-4  border-solid mx-auto`}></div>
  )
}

export default Spinner