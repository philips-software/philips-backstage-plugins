#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to display error message and exit
function error_exit {
  echo -e "\n${RED}ERROR: $1${NC}" 1>&2
  exit 1
}

# Function to display section headers
function section_header {
  echo -e "\n${BLUE}=================================================${NC}"
  echo -e "${BLUE}   $1${NC}"
  echo -e "${BLUE}=================================================${NC}\n"
}

# Function to run command with output handling
# Shows output only on error, otherwise hides it
function run_command {
  local cmd="$1"
  local error_msg="$2"
  local temp_output=$(mktemp)

  echo -e "$3"

  # Run the command and capture output
  eval "$cmd" >"$temp_output" 2>&1
  local status=$?

  if [ $status -ne 0 ]; then
    echo -e "\n${RED}❌ Command failed. Output:${NC}\n"
    cat "$temp_output"
    rm "$temp_output"
    error_exit "$error_msg"
  else
    rm "$temp_output"
    echo -e "${GREEN}✅ $4${NC}"
  fi
}

# Function to run interactive commands that require user input
function run_interactive_command {
  local cmd="$1"
  local error_msg="$2"

  echo -e "$3"

  # Run the command directly without capturing output
  eval "$cmd"
  local status=$?

  if [ $status -ne 0 ]; then
    error_exit "$error_msg"
  else
    echo -e "${GREEN}✅ $4${NC}"
  fi
}

section_header "BACKSTAGE WORKSPACE UPGRADE"
echo -e "${GREEN}This script will guide you through upgrading a Backstage workspace.${NC}\n"

# List available workspaces
section_header "WORKSPACE SELECTION"
echo -e "${YELLOW}Please select a workspace to upgrade from the list below:${NC}"
workspaces=(workspaces/*)
select workspace in "${workspaces[@]}"; do
  if [ -n "$workspace" ]; then
    echo -e "\n${GREEN}✅ Selected workspace: ${YELLOW}$(basename "$workspace")${NC}\n"
    break
  else
    echo -e "\n${RED}❌ Invalid selection. Please try again.${NC}\n"
  fi
done

# Change to the selected workspace directory
section_header "PREPARING WORKSPACE"
echo -e "📂 Changing to workspace directory: ${YELLOW}$workspace${NC}"
cd "$workspace" || error_exit "Failed to change directory to $workspace"
echo -e "${GREEN}✅ Successfully changed to workspace directory${NC}"

# Update yarn to the latest stable version
section_header "UPDATING YARN"
run_command "yarn set version stable" "Failed to update yarn to the latest stable version" \
  "🧶 Updating yarn to latest stable version..." \
  "Successfully updated yarn"

# Install dependencies with new yarn version
section_header "INSTALLING DEPENDENCIES"
run_command "yarn install" "Failed to install dependencies" \
  "📦 Installing dependencies with updated yarn version..." \
  "Successfully installed dependencies"

# Import the yarn plugin
section_header "IMPORTING YARN PLUGIN"
run_command "yarn plugin import https://versions.backstage.io/v1/tags/main/yarn-plugin" "Failed to import yarn plugin" \
  "🔌 Importing Backstage yarn plugin..." \
  "Successfully imported yarn plugin"

# Bump backstage versions
section_header "BUMPING BACKSTAGE VERSIONS"
run_command "yarn backstage-cli versions:bump" "Failed to bump backstage versions" \
  "⬆️ Bumping Backstage versions to latest..." \
  "Successfully bumped versions"

# Deduplicate dependencies
section_header "DEDUPLICATING DEPENDENCIES"
run_command "yarn dedupe" "Failed to deduplicate dependencies" \
  "🧹 Deduplicating dependencies..." \
  "Successfully deduplicated dependencies"

# TypeScript compilation
section_header "COMPILING TYPESCRIPT"
run_command "yarn tsc" "TypeScript compilation failed" \
  "📝 Running TypeScript compilation..." \
  "Successfully compiled TypeScript"

# Run tests with coverage
section_header "RUNNING TESTS"
run_command "yarn test --coverage" "Tests failed" \
  "🧪 Running tests with coverage..." \
  "All tests passed successfully"

# Run changeset - Interactive command
section_header "CREATING CHANGESET"
run_interactive_command "yarn changeset" "Changeset failed" \
  "📦 Creating changeset for version tracking...\n${YELLOW}Please provide input for the changeset when prompted:${NC}" \
  "Successfully created changeset"

# Run prettier to format code
section_header "FORMATTING CODE"
run_command "yarn prettier --write ." "Prettier formatting failed" \
  "✨ Formatting code with prettier..." \
  "Successfully formatted code"

section_header "UPGRADE COMPLETE"
echo -e "${GREEN}🎉 Workspace upgrade completed successfully!${NC}"
echo -e "${YELLOW}Workspace ${NC}$(basename "$workspace")${YELLOW} has been upgraded to the latest Backstage version.${NC}\n"
