printf -v date '%(%Y%m%d)T'
file_name="${date}.gz" 
pg_dump -U addb -d addb | gzip > "$file_name"

BUCKET_NAME="addb"
PREFIX="backups"

objects=$(aws s3api list-objects-v2 \
  --bucket "$BUCKET_NAME" \
  --prefix "$PREFIX" \
  --query "Contents[*].[LastModified, Key]" \
  --output text)

object_count=$(echo "$objects" | wc -l)

if [ "$object_count" -gt 5 ]; then
    echo "Fewer than 6 items in bucket, nothing to delete."
    oldest_key=$(echo "$objects" | sort | head -n 1 | awk '{print $2}')

    # Confirm deletion target
    echo "Deleting oldest object: $oldest_key"

    # Delete the oldest object
    aws s3api delete-object --bucket "$BUCKET_NAME" --key "$oldest_key"
fi

aws s3 mv "$file_name" "s3://addb/backups/${file_name}"
