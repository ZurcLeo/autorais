import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const FlowDiagram = ({ nodes, edges }) => {
  const svgRef = useRef(null);

  console.log("FlowDiagram Nodes:", nodes);
  console.log("FlowDiagram Edges:", edges);

  useEffect(() => {
    // Certifique-se de que nodes e edges estão definidos antes de prosseguir
    if (!nodes || !edges) {
      console.error("FlowDiagram: Dados 'nodes' ou 'edges' ausentes.");
      return;
    }

    const svg = d3.select(svgRef.current)
      .attr("width", 800)
      .attr("height", 600);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(edges).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(400, 300));

    // Renderizar arestas
    const link = svg.append("g")
      .selectAll("line")
      .data(edges)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Renderizar nós
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 8)
      .attr("fill", d => d.type === 'event' ? "#ff7700" : "#0077ff")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("title")
      .text(d => d.label);

    // Atualizar posições
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });

    // Função de limpeza (opcional)
    return () => {
      // Limpar a simulação para evitar vazamentos de memória
      simulation.stop();
      // Remover todos os elementos SVG criados pelo D3
      svg.selectAll("*").remove();
    };
  }, [nodes, edges]); // Dependência em nodes e edges para atualizar o gráfico se os dados mudarem

  return <svg ref={svgRef} id="flow-diagram" />;
};

// Funções dragstarted, dragged, dragended (conforme fornecido anteriormente)
function dragstarted(event, d) {
  if (!event.active) d3.select(event.target).raise().classed("active", true);
}

function dragged(event, d) {
    d.x = event.x;
    d.y = event.y;
    d3.select(this).attr("cx", d.x).attr("cy", d.y);
}

function dragended(event, d) {
  if (!event.active) d3.select(event.target).classed("active", false);
}

export default FlowDiagram;