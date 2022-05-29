# Amazon S3 Bucket upload

This actor allows you to upload the default dataset of an actor's run to an AWS S3 bucket. It provides easy-to-use tools for injecting information into file names/path names. Additionally, it provides the option of either uploading the entire dataset to one file, or each dataset item as its own file.

The Amazon S3 Bucket upload actor is best used within the webhooks of another actor, as to allow for the automatic uploading of its default dataset's items.

## Input

Divided into two short sections, this actor's input is intuitive.

### Bucket configuration

This section contains details for configuring your bucket. Ensure that you've filled in everything exactly right, especially your credentials.

> To learn more about how to get your credentials, check out [this](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html) page.

### Data configuration

In this section, you provide the run ID of the actor, as well as the path for the item and the file name. There are some restrictions for the `fileName` and `pathName` inputs as to prevent unnecessary errors:

-   `pathName` cannot start with or end with a `/` symbol.
-   Neither field can include a period (`.`) character. (the file extension will be automatically added for you)
-   `fileName` can't include any `/` characters.

Within `pathName` and `fileName`, you have access to 6 variables:

| Variable      | Example                                | Description                                         |
| ------------- | -------------------------------------- | --------------------------------------------------- |
| `actorName`   | `my-actor`                             | The name of the actor matching the provided run ID. |
| `runId`       | `BC6hdJvyNQStvYLL8`                    | The run ID of the actor which was provided          |
| `date`        | `2022-05-29`                           | The date at which the actor finished its run.       |
| `now`         | `1653851198127`                        | The current time in milliseconds.                   |
| `uuid`        | `b2638dac-00b5-4e29-b698-fe70b6ee6e0b` | A totally unique ID.                                |
| `incrementor` | `3`                                    | An integer that increments up for every item.       |

Variables allow you to easily generate unique file names when writing multiple files (preventing files from being overwritten). `now` and `uuid` are great options when you need unique values. Here is an example of them being used in the actor's input:

```JSON
{
  "pathName": "{actorName}/datasets/{date}",
  "fileName": "{uuid}-item",
  "separateItems": true
}
```

> Notice, you must wrap a variable name in `{curlyBraces}` for it to work.

Here is what the final path for one file might look like with this configuration:

```text
my-actor/datasets/2022-05-29/b2638dac-00b5-4e29-b698-fe70b6ee6e0b-item.json
```

By default, the actor will write the entire dataset as one file in the S3 bucket. In order to write each dataset item as a separate file in the S3 bucket, set `separateItems` to true.
