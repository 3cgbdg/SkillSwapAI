import { join } from './path.js';
const types = ['peerDependencies', 'devDependencies', 'optionalDependencies', 'dependencies'];
export function createWorkspaceGraph(cwd, wsNames, wsPkgNames, wsPackages) {
    const graph = new Map();
    const packages = Array.from(wsPackages.values());
    const getWorkspaceDirs = (pkg) => {
        const dirs = new Set();
        for (const type of types) {
            if (pkg.manifest[type]) {
                for (const pkgName in pkg.manifest[type]) {
                    if (wsPkgNames.has(pkgName)) {
                        const wsPackage = packages.find(pkg => pkg.pkgName === pkgName);
                        if (wsPackage)
                            dirs.add(wsPackage.dir);
                    }
                }
            }
        }
        return dirs;
    };
    for (const name of wsNames) {
        const pkg = wsPackages.get(name);
        if (pkg)
            graph.set(join(cwd, name), getWorkspaceDirs(pkg));
    }
    return graph;
}
