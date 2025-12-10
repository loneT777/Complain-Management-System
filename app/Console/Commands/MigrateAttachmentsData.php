<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Attachment;
use App\Models\AttachmentGroup;
use App\Models\AttachmentFile;

class MigrateAttachmentsData extends Command
{
    protected $signature = 'attachments:migrate-data';
    protected $description = 'Migrate data from attachments table to attachment_groups and attachment_files';

    public function handle()
    {
        $this->info('Starting attachment data migration...');

        DB::beginTransaction();

        try {
            // Get all old attachments grouped by their logical group
            $attachments = DB::table('attachments_old')
                ->orderBy('uploaded_at')
                ->get();

            if ($attachments->isEmpty()) {
                $this->info('No attachments to migrate.');
                return 0;
            }

            // Group attachments by complaint_id, description, and upload time (same minute)
            $groups = [];
            
            foreach ($attachments as $attachment) {
                $uploadTime = \Carbon\Carbon::parse($attachment->uploaded_at);
                $uploadMinute = $uploadTime->format('Y-m-d H:i');
                
                $groupKey = sprintf(
                    '%s_%s_%s',
                    $attachment->complaint_id ?? 'null',
                    $attachment->description ?? 'nodesc',
                    $uploadMinute
                );

                if (!isset($groups[$groupKey])) {
                    $groups[$groupKey] = [
                        'complaint_id' => $attachment->complaint_id,
                        'complaint_log_id' => $attachment->complaint_log_id,
                        'user_id' => $attachment->user_id,
                        'description' => $attachment->description,
                        'uploaded_at' => $attachment->uploaded_at,
                        'files' => []
                    ];
                }

                $groups[$groupKey]['files'][] = [
                    'file_name' => $attachment->file_name,
                    'file_path' => $attachment->file_path,
                    'extension' => $attachment->extension,
                ];
            }

            $this->info(sprintf('Found %d groups from %d attachments', count($groups), count($attachments)));

            // Create groups and files
            foreach ($groups as $groupData) {
                $group = AttachmentGroup::create([
                    'complaint_id' => $groupData['complaint_id'],
                    'complaint_log_id' => $groupData['complaint_log_id'],
                    'user_id' => $groupData['user_id'],
                    'description' => $groupData['description'],
                    'uploaded_at' => $groupData['uploaded_at'],
                ]);

                foreach ($groupData['files'] as $fileData) {
                    AttachmentFile::create([
                        'attachment_group_id' => $group->id,
                        'file_name' => $fileData['file_name'],
                        'file_path' => $fileData['file_path'],
                        'extension' => $fileData['extension'],
                    ]);
                }

                $this->info(sprintf('Created group #%d with %d files', $group->id, count($groupData['files'])));
            }

            DB::commit();

            $this->info('Migration completed successfully!');
            $this->info('You can now drop the old attachments table if needed.');

            return 0;

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Migration failed: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return 1;
        }
    }
}
