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
    apiImage, uiImage, ingressImage, cause, sha, env='staging', branch='', repo='',
    buildId=''
)
    // We only allow registration of hostnames attached to '*.apps.allenai.org'
    // at this point. If you need a custom domain, contact us: reviz@allenai.org.
    local topLevelDomain = '.apps.allenai.org';
    local hosts = [
        if env == 'prod' then
            config.appName + topLevelDomain
        else
            config.appName + '.' + env + topLevelDomain
    ];

    // In production we run two versions of your application, as to ensure that
    // if one instance goes down or is busy, end users can still use the application.
    // In all other environments we run a single instance to save money.
    local replicas = (
        if env == 'prod' then
            2
        else
            1
    );

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

    // Annotations carry additional information about your deployment that
    // we use for auditing, debugging and administrative purposes
    local annotations = {
        "apps.allenai.org/sha": sha,
        "apps.allenai.org/branch": branch,
        "apps.allenai.org/repo": repo,
        "apps.allenai.org/build": buildId
    };

    local ingressPort = 80;
    local apiPort = 3000;

    local ingressHealthCheck = {
        port: ingressPort,
        scheme: 'HTTP'
    };

    local apiHealthCheck = {
        port: apiPort,
        scheme: 'HTTP'
    };

    local uiHealthCheck = {
        port: 4000,
        scheme: 'HTTP'
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
                                    servicePort: ingressPort
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
            revisionHistoryLimit: 3,
            replicas: replicas,
            selector: {
                matchLabels: labels
            },
            template: {
                metadata: {
                    name: fullyQualifiedName,
                    namespace: namespaceName,
                    labels: labels,
                    annotations: annotations
                },
                spec: {
                    volumes: [
                        {
                            name: fullyQualifiedName + '-db-password',
                            secret: {
                                secretName: 'db'
                            }
                        },
                    ],
                    containers: [
                        {
                            name: fullyQualifiedName + '-api',
                            image: apiImage,
                            readinessProbe: {
                                httpGet: apiHealthCheck + {
                                    path: '/health?check=rdy'
                                }
                            },
                            livenessProbe: {
                                httpGet: apiHealthCheck + {
                                    path: '/health?check=rdy'
                                }
                            },
                            resources: {
                                requests: {
                                    cpu: '0.5',
                                    memory: '1.4Gi'
                                }
                            },
                            env: [
                                {
                                    name: 'SECRETS_FILE',
                                    value: '/secrets/secret.json'
                                },
                            ],
                            volumeMounts: [
                                {
                                    name: fullyQualifiedName + '-db-password',
                                    mountPath: '/secrets',
                                    readOnly: true
                                }
                            ],
                        },
                        {
                            name: fullyQualifiedName + '-ui',
                            image: uiImage,
                            readinessProbe: {
                                httpGet: uiHealthCheck + {
                                    path: '/?check=rdy'
                                }
                            },
                            livenessProbe: {
                                httpGet: uiHealthCheck + {
                                    path: '/?check=live'
                                }
                            },
                            resources: {
                                requests: {
                                   cpu: '0.2',
                                   memory: '500Mi'
                                }
                            }
                        },
                        {
                            name: fullyQualifiedName + '-ingress',
                            image: ingressImage,
                            readinessProbe: {
                                httpGet: ingressHealthCheck + {
                                    path: '/?check=rdy'
                                }
                            },
                            livenessProbe: {
                                httpGet: ingressHealthCheck + {
                                    path: '/?check=live'
                                }
                            },
                            resources: {
                                requests: {
                                   cpu: '0.2',
                                   memory: '500Mi'
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
            selector: labels,
            ports: [
                {
                    port: ingressPort,
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
