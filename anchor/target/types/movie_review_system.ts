/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/movie_review_system.json`.
 */
export type MovieReviewSystem = {
  "address": "3F4fsF8VBR2sqWMPLLwAuL9ACxwt8QM8HZJdGm9BVJMy",
  "metadata": {
    "name": "movieReviewSystem",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createMovie",
      "discriminator": [
        16,
        217,
        163,
        168,
        229,
        18,
        135,
        254
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "movieAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  118,
                  105,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "movie"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "movie",
          "type": "string"
        },
        {
          "name": "director",
          "type": "string"
        },
        {
          "name": "hero",
          "type": "string"
        },
        {
          "name": "releaseYear",
          "type": "u16"
        }
      ]
    },
    {
      "name": "createReview",
      "discriminator": [
        69,
        237,
        87,
        43,
        238,
        125,
        40,
        1
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "movieAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  118,
                  105,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "movie_account.movie",
                "account": "movieAccount"
              }
            ]
          }
        },
        {
          "name": "movieReview",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  118,
                  105,
                  101,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "movieAccount"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "movieRating",
          "type": "u8"
        },
        {
          "name": "reviewComment",
          "type": "string"
        },
        {
          "name": "reviewerName",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteMovieReview",
      "discriminator": [
        145,
        87,
        218,
        149,
        170,
        123,
        217,
        101
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "movieReview",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  118,
                  105,
                  101,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "movieAccount"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "movieAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  118,
                  105,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "movie_account.movie",
                "account": "movieAccount"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "updateReview",
      "discriminator": [
        254,
        84,
        60,
        221,
        68,
        163,
        94,
        29
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "movieAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  111,
                  118,
                  105,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "movie_account.movie",
                "account": "movieAccount"
              }
            ]
          }
        },
        {
          "name": "movieReview",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  118,
                  105,
                  101,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "movieAccount"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "movieRating",
          "type": "u8"
        },
        {
          "name": "reviewComment",
          "type": "string"
        },
        {
          "name": "reviewerName",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "movieAccount",
      "discriminator": [
        16,
        227,
        16,
        231,
        200,
        106,
        89,
        6
      ]
    },
    {
      "name": "movieReview",
      "discriminator": [
        215,
        156,
        48,
        235,
        255,
        205,
        137,
        94
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidUserToCreateMovie",
      "msg": "Invalid user to create movie, only admin can create movie"
    },
    {
      "code": 6001,
      "name": "movieReviewAccountAlreadyExists",
      "msg": "Movie review account already exists"
    },
    {
      "code": 6002,
      "name": "invalidMovie",
      "msg": "Invalid Movie, Movie does not exist"
    },
    {
      "code": 6003,
      "name": "reviewCommentTooLong",
      "msg": "Review comment is too long"
    },
    {
      "code": 6004,
      "name": "reviewerNameTooLong",
      "msg": "Reviewer name is too long"
    },
    {
      "code": 6005,
      "name": "invalidMovieRating",
      "msg": "Invalid movie rating, must be between 1 and 10"
    },
    {
      "code": 6006,
      "name": "unauthorizedReviewUpdate",
      "msg": "Unauthorized review update attempt"
    }
  ],
  "types": [
    {
      "name": "movieAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "releaseYear",
            "type": "u16"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "movie",
            "type": "string"
          },
          {
            "name": "director",
            "type": "string"
          },
          {
            "name": "hero",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "movieReview",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "movieRating",
            "type": "u8"
          },
          {
            "name": "movieAddress",
            "type": "pubkey"
          },
          {
            "name": "reviewComment",
            "type": "string"
          },
          {
            "name": "reviewerName",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "reviewer",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
