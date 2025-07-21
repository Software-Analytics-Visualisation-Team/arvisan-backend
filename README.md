# Architecture Visualization & Analysis (ARVISAN) backend

This is the backend for the architecture
visualizer and analysis tool ARViSAN.

## Table of Contents
- [ARViSAN repositories](#arvisan-repositories)
- [Getting Started](#getting-started)
- [Development](#development)
    - [Requirements for local development](#requirements-for-local-development)
    - [Database (Neo4j)](#database-neo4j)
    - [Local installation](#local-installation)

## ARViSAN repositories
ARViSAN is separated into two main and two additional repositories described below:
 - **[ARViSAN frontend](https://github.com/Software-Analytics-Visualisation-Team/arvisan-frontend)**: Responsible for rendering the graph and showing the analyses to the end user.
- **ARVISAN backend (this repository)**: Contains various endpoints for processing and executing queries to the graph database. 
- **[ARVISAN dependency parser](https://github.com/Software-Analytics-Visualisation-Team/arvisan-dependency-parser)**: Extendable Python script to preprocess software dependencies and convert them in ARViSAN's input format. Can be used to create input for visualizing confromance between expected (allowed) dependencies and actual (implementation) dependencies.
- **[ARVISAN input parser](https://github.com/Software-Analytics-Visualisation-Team/arvisan-input-parser)**:  Script created to specifically parse *OutSystems* consumer-producer data with functional domain (Application group) data into a labeled property graph, readable by Cytoscape. This script was used in the proof-of-concept version of ARViSAN.

## Getting Started
ARViSAN can be run easily using Docker. To get started quickly:

1) Clone the frontend (https://github.com/Software-Analytics-Visualisation-Team/arvisan-frontend)
2) Clone this repository in the same parent folder as the front-end repository.
3) Navigate to the `arvisan-backend` directory and execute the following command:

```sh
docker-compose up
```

This command will build and start the containers defined in the docker-compose.yml file. Once the containers are up and running, you can access the application on localhost:5173. After opening the visualization, use the credentials:test_user and test_password to log in.

When opening the tool for the first time, there will be no data. To seed the data click on the Seeder button, which will open the 'ARViSAN input parser' popup. Open the Import tab and upload the nodes and edges CSV files from the data folder. Afterwards, click on Submit. You will then see the welcome popup again and once the data has been loaded on the bottom you will see All_Subsystem_Group as an entry point to the visualization. When you click Select you will see a graph containing all subsystem groups as nodes.

This stack contains the backend, frontend, and an empty Neo4j database instance. The Neo4j database within the Docker stack can also be replaced by a local Neo4j instance (for example Neo4j Desktop).


## Development
### Requirements for local development
- NodeJS 20. Dependencies are installed with pnpm.
- A Neo4j database (v5) with the APOC plugin installed. 
To install APOC in Neo4j Desktop, click your database project in the app and a sidebar should open on the right.
You can install APOC from the "Plugins" tab.

### Database (Neo4j)
Because the tool outputs a graph, a graph database is required for easier querying.
In this case, an instance of Neo4j is used as a database.
The backend only reads the data; it does not do any insertions.
Therefore, you have to add any data to the database yourself.

The backend also requires a certain database structure.
First, all the nodes should be layered/clustered.
During development, the following graph layers (from top to bottom) and have been used:

- Domain
- Application
- Sublayer, together with one of sublayer_Enduser, sublayer_Core, sublayer_API, sublayer_CompositeLogic, sublayer_CoreService, sublayer_CoreWidgets
sublayer_Foundation, sublayer_StyleGuide, sublayer_FoundationService, sublayer_Library*
- Module

_* Labels should only contain alphanumerical characters within the limitations of Neo4j. If a label contains an underscore,
this will be interpreted as a "class" of nodes within the layer._

The hierarchical tree-like structure should always have a top layer with only "Domain" nodes.
There should __not__ be a single root node that contains all "Domain" nodes (i.e. the domain layer
(top layer) is not contained by any other layers).
Every graph layer should be linked to the graph layer above using a directed relationship with the "CONTAINS" label.

Each sublayer node has the label "Sublayer" and one of the class labels.
It has exactly one directed containment edge from an application.

Dependencies should only exist on the lower "Module" layer.
These relationships can have any label, but during testing the label CALLS was used.

Violation rules are also defined in the database.
- Sublayer violations are added to the database, simply as a VIOLATES relationship between two sublayer nodes.

The [example datasets folder](example-dataset) contains a set of nodes a set of relationships, which can be used as an example.
See "How to deploy" how this dataset can be seeded in a production environment.
For a local installation, it's best to use Neo4j Admin tools.

### Local installation

To install the backend manually:
- Install NodeJS 20 and npm.
- Install Neo4j and create a database with a corresponding user. Don't forget to install APOC as well.
- Copy .env-example to .env. Add the Neo4j user credentials (username and password) to the Neo4j environment variables.
Also choose a username and password, which is used to authenticate with this backend.
- Install all dependencies: `npm install`.
- Start the application: `npm run dev`. If you get an error 
- The backend is now accessible on http://localhost:3000. The API documentation can be viewed at http://localhost:3000/api-docs
