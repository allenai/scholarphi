/**
 * This is a template that's compiled down to a definition of the
 * infrastructural resources required for running your application.
 *
 * For more information on the JSONNET language, see:
 * https://jsonnet.org/learning/getting_started.html
 */

// This file is generated once at template creation time and unlikely to change
// from that point forward.
local config = import '../skiff.json';

function(
    uiImage,
    paperSrvImage,
    apiImage,
    proxyImage,
    cause,
    sha,
    env='staging',
    branch='',
    repo='',
    buildId=''
)
    // We only allow registration of hostnames attached to '*.apps.allenai.org'
    // at this point. If you need a custom domain, contact us: reviz@allenai.org.
    local topLevelDomain = '.apps.allenai.org';

    // This just makes sure we don't accidentally blow away production.
    assert env != 'prod';

    local hosts = [ config.appName + '.' + env + topLevelDomain ];
    local replicas = 1;

    // There's a lot of ports to keep track of, so we put them all in one place.
    local uiPort = 3001;
    local paperSrvPort = 3002;
    local apiPort = 8000;
    local proxyPort = 8080;

    // Each app gets it's own namespace.
    local namespaceName = config.appName;

    // Since we deploy resources for different environments in the same namespace,
    // we need to give things a fully qualified name that includes the environment
    // as to avoid unintentional collission / redefinition.
    local fullyQualifiedName = config.appName + '-' + env;

    // Every resource is tagged with the same set of labels. These labels serve the
    // following purposes:
    //  - They make it easier to query the resources, i.e.
    //      kubectl get pod -l app=my-app,env=staging
    //  - The service definition uses them to find the pods it directs traffic to.
    local namespaceLabels = {
        app: config.appName,
        contact: config.contact,
        team: config.team
    };

    local labels = namespaceLabels + {
        env: env
    };

    local selectorLabels = {
        app: config.appName,
        env: env
    };

    // Annotations carry additional information about your deployment that
    // we use for auditing, debugging and administrative purposes
    local annotations = {
        "apps.allenai.org/sha": sha,
        "apps.allenai.org/branch": branch,
        "apps.allenai.org/repo": repo,
        "apps.allenai.org/build": buildId
    };

    local namespace = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
            name: namespaceName,
            labels: namespaceLabels
        }
    };

    local ingress = {
        apiVersion: 'extensions/v1beta1',
        kind: 'Ingress',
        metadata: {
            name: fullyQualifiedName,
            namespace: namespaceName,
            labels: labels,
            annotations: annotations + {
                'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
                'kubernetes.io/ingress.class': 'nginx',
                'nginx.ingress.kubernetes.io/ssl-redirect': 'true'
            }
        },
        spec: {
            tls: [
                {
                    secretName: fullyQualifiedName + '-tls',
                    hosts: hosts
                }
            ],
            rules: [
                {
                    host: host,
                    http: {
                        paths: [
                            {
                                backend: {
                                    serviceName: fullyQualifiedName,
                                    servicePort: proxyPort
                                }
                            }
                        ]
                    }
                } for host in hosts
            ]
        }
    };

    local deployment = {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
            labels: labels,
            name: fullyQualifiedName,
            namespace: namespaceName,
            annotations: annotations + {
                'kubernetes.io/change-cause': cause
            }
        },
        spec: {
            strategy: {
                type: 'RollingUpdate',
                rollingUpdate: {
                    maxSurge: replicas // This makes deployments faster.
                }
            },
            revisionHistoryLimit: 3,
            replicas: replicas,
            selector: {
                matchLabels: selectorLabels
            },
            template: {
                metadata: {
                    name: fullyQualifiedName,
                    namespace: namespaceName,
                    labels: labels,
                    annotations: annotations
                },
                spec: {
                    containers: [
                        {
                            name: fullyQualifiedName + '-api',
                            image: apiImage,
                            readinessProbe: {
                                httpGet: {
                                    port: apiPort,
                                    scheme: 'HTTP',
                                    path: '/'
                                }
                            },
                            resources: {
                                requests: {
                                    cpu: '0.1',
                                    memory: '500MB'
                                }
                            }
                        },
                        {
                            name: fullyQualifiedName + '-ui',
                            image: uiImage,
                            readinessProbe: {
                                httpGet: {
                                    port: uiPort,
                                    scheme: 'HTTP',
                                    path: '/'
                                }
                            },
                            resources: {
                                requests: {
                                   cpu: '0.1',
                                   memory: '100M'
                                }
                            }
                        },
                        {
                            name: fullyQualifiedName + '-papersrv',
                            image: paperSrvImage,
                            readinessProbe: {
                                httpGet: {
                                    port: paperSrvPort,
                                    scheme: 'HTTP',
                                    path: '/health'
                                }
                            },
                            resources: {
                                requests: {
                                   cpu: '0.1',
                                   memory: '100Mi'
                                }
                            }
                        },
                        {
                            name: fullyQualifiedName + '-proxy',
                            image: proxyImage,
                            readinessProbe: {
                                httpGet: {
                                    port: proxyPort,
                                    scheme: 'HTTP',
                                    path: '/health'
                                }
                            },
                            resources: {
                                requests: {
                                   cpu: '0.1',
                                   memory: '100Mi'
                                }
                            }
                        }
                    ]
                }
            }
        }
    };

    local service = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: fullyQualifiedName,
            namespace: namespaceName,
            labels: labels,
            annotations: annotations
        },
        spec: {
            selector: selectorLabels,
            ports: [
                {
                    port: proxyPort,
                    name: 'http'
                }
            ]
        }
    };

    [
        namespace,
        ingress,
        deployment,
        service
    ]
