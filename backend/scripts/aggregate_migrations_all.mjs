// Import External Packages
import fs from "fs"
import path from "path"

/**
 * Asynchronously checks if a given path exists and is a directory.
 * @param dirPath - The path to check.
 */
const isDirectory = async (dirPath) => {
  try {
    const stats = await fs.promises.stat(dirPath)
    return stats.isDirectory()
  } catch {
    return false
  }
}

/**
 * Aggregates all SQL migration files from module migrations folders into a single file.
 */
const aggregateMigrations = async () => {
  try {
    // Define base paths
    const projectRoot = path.resolve(import.meta.dirname, "./../")
    console.log(`🚀 Aggregating migrations from ${projectRoot}`)
    const appRoot = path.join(projectRoot,"supabase", "db")
    const migrationsOutputDir = path.join(projectRoot, "supabase", "migrations")

    // Ensure the output directory exists
    await fs.promises.mkdir(migrationsOutputDir, { recursive: true })

    // Empty the current migrations directory
    const files = await fs.promises.readdir(migrationsOutputDir)
    for (const file of files) {
      await fs.promises.unlink(path.join(migrationsOutputDir, file))
    }

    // // Define paths to search for migrations
    // const searchPaths = [
    //   path.join(appRoot, "__core"),
    //   path.join(appRoot, "__shared"),
    //   path.join(appRoot, "__extensions")
    // ]

    // Generate output filename with current date
    const currentDate = new Date()
    const yyyy = currentDate.getFullYear()
    const mm = String(currentDate.getMonth() + 1).padStart(2, "0") // Months start at 0
    const dd = String(currentDate.getDate()).padStart(2, "0")
    const outputFileName = `${yyyy}${mm}${dd}_core_structure.sql`
    const outputPath = path.join(migrationsOutputDir, outputFileName)

    // Initialize an array to hold migration contents
    const aggregatedMigrations = []

    // Initialize an array to hold migration file metadata
    const migrationFiles = []

    // Read all module directories under root directory
    const modules = await fs.promises.readdir(appRoot)

    for (const moduleName of modules) {
      const modulePath = path.join(appRoot, moduleName)
      const isDir = await isDirectory(modulePath)
      if (!isDir) continue // Skip if not a directory

      // Check if migrations directory exists
      const migrationsExist = await isDirectory(modulePath)
      if (!migrationsExist) continue // Skip if migrations folder doesn't exist

      // Read all .sql files in the migrations directory
      const files = await fs.promises.readdir(modulePath)
      const sqlFiles = files.filter((file) => file.endsWith(".sql"))

      console.log(`📂 Processing Module: ${moduleName}`)

      for (const sqlFile of sqlFiles) {
        console.log(`   📄 Adding Migration: ${sqlFile}`)
        const filePath = path.join(modulePath, sqlFile)
        let fileContent = await fs.promises.readFile(filePath, "utf-8")
        fileContent = fileContent.replace("BEGIN;", "").replace("COMMIT;", "")

        // Push migration file data for global sorting
        migrationFiles.push({
          moduleName,
          fileName: sqlFile,
          filePath,
          content: fileContent.trim()
        })
      }
    }

    if (migrationFiles.length === 0) {
      console.warn("❌ No migration files found to aggregate.")
      return
    }

    // When two files share the same numeric prefix (e.g. multiple modules use 101_* for tables),
    // sort by this list so dependencies run first (user-management → auth → org → customer → integration, etc.).
    const MODULE_ORDER = {
      "user-management": 0,
      "user-auth": 1,
      "organization": 2,
      "customer": 3,
      "integration": 4,
      "media": 5,
      "post": 6,
      comment: 7,
      rbac: 8,
      config: 9,
      feedback: 10,
      blog: 11,
      notification: 12
    }
    const moduleOrder = (name) => (MODULE_ORDER[name] ?? 99)

    const numericPrefix = (fileName) => {
      const n = Number.parseInt(fileName.split("_")[0], 10)
      return Number.isFinite(n) ? n : 0
    }

    // Sort by scope band (100s: tables, 200s: indexes, …), then module dependency order.
    // Within a band, filenames can repeat the same small prefix per folder (e.g. 101_*) without
    // forcing cross-module numeric ordering; MODULE_ORDER supplies the real sequence.
    const scopeTier = (fileName) => Math.floor(numericPrefix(fileName) / 100)

    migrationFiles.sort((a, b) => {
      const tierA = scopeTier(a.fileName)
      const tierB = scopeTier(b.fileName)
      if (tierA !== tierB) return tierA - tierB
      const modCmp = moduleOrder(a.moduleName) - moduleOrder(b.moduleName)
      if (modCmp !== 0) return modCmp
      const prefixCmp = numericPrefix(a.fileName) - numericPrefix(b.fileName)
      if (prefixCmp !== 0) return prefixCmp
      return a.fileName.localeCompare(b.fileName)
    })

    for (const migration of migrationFiles) {
      aggregatedMigrations.push(
        `-- Module: ${migration.moduleName}, File: ${migration.fileName}`
      )
      aggregatedMigrations.push(migration.content)
      aggregatedMigrations.push("\n") // Add a newline for separation
    }

    // Define the disclaimer
    const disclaimer = `
        -- ******************************************************************************
        -- *                AUTOGENERATED FILE                                          *
        -- *  This file is automatically generated by the migration                     *
        -- *  aggregation script. Do not edit this file directly.                       *
        -- *  To make changes, modify the individual module                             *
        -- *  migration files located in backend/[MODULE]/migrations/*.sql    *
        -- ******************************************************************************
        `

    const preamble = `BEGIN;`
    const postamble = `COMMIT;`

    const finalContent = [
      disclaimer,
      preamble,
      ...aggregatedMigrations,
      postamble
    ].join("\n")

    // Write the aggregated migrations to core_structure.sql
    await fs.promises.writeFile(outputPath, finalContent, "utf-8")

    console.log(
      `✅ Successfully aggregated migrations into ${path.relative(
        projectRoot,
        outputPath
      )}`
    )
  } catch (error) {
    console.error("❌ Error aggregating migrations:", error)
    process.exit(1)
  }
}

// Execute the aggregation
aggregateMigrations()
