Prioritize
==========

A tool which provides right ordering based on the dependency information provided

Using Desktop Version
=====================

The Desktop version is available in tmp directory. Copy the whole directory to desktop and execute Prioritize.exe.

Building Desktop Version
========================

grunt dist-win - Builds for Windows.

Web Version
===========

Web version can be directly opened in browser from app/index.html

Algorithms Used
===============

For Cycle Detection - Tarjans SCC Algorithms is used to find the strongly connected components. Any component with size more than one indicates the presence of Cycle

For Topological Sort - Basic DFS is used for Topological Sort once we make sure that there is no cycle in the given dependency information.
